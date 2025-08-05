import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { xenditService } from "@/lib/xendit"
import db from "@/lib/db"

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    let query = `
      SELECT 
        o.*,
        opi.product_id,
        opi.quantity,
        opi.price as unit_price,
        opi.is_flash_sale,
        opi.flash_sale_discount_percent,
        opi.original_price,
        opi.savings_amount,
        opi.account_email,
        opi.account_password,
        p.name as product_name,
        p.slug as product_slug,
        c.name as category_name,
        CASE 
          WHEN o.status = 'pending' AND o.expires_at < NOW() THEN 'expired'
          WHEN o.status = 'pending' AND o.expires_at >= NOW() THEN 'active'
          ELSE o.status
        END as display_status,
        TIMESTAMPDIFF(MINUTE, NOW(), o.expires_at) as minutes_until_expiry
      FROM orders o
      LEFT JOIN order_premium_items opi ON o.id = opi.order_id
      LEFT JOIN premium_products p ON opi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.user_id = ? AND o.type = 'premium_account'
    `

    const queryParams: any[] = [user.id]

    if (status && status !== "all") {
      if (status === "expired") {
        query += " AND o.status = 'pending' AND o.expires_at < NOW()"
      } else {
        query += " AND o.status = ?"
        queryParams.push(status)
      }
    }

    query += ` ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const [rows] = await db.execute(query, queryParams)
    const orders = rows as any[]

    // Group order items by order
    const groupedOrders = orders.reduce((acc, row) => {
      const orderId = row.id
      if (!acc[orderId]) {
        acc[orderId] = {
          id: row.id,
          order_number: row.order_number,
          type: row.type,
          total_amount: Number.parseFloat(row.total_amount),
          status: row.status,
          display_status: row.display_status,
          payment_method: row.payment_method || "xendit",
          payment_status: row.payment_status || "pending",
          xendit_invoice_id: row.xendit_invoice_id,
          xendit_invoice_url: row.xendit_invoice_url,
          expires_at: row.expires_at,
          minutes_until_expiry: row.minutes_until_expiry,
          auto_cancelled_at: row.auto_cancelled_at,
          cancellation_reason: row.cancellation_reason,
          created_at: row.created_at,
          updated_at: row.updated_at,
          can_cancel: row.status === "pending" && row.display_status === "active" && row.minutes_until_expiry > 0,
          items: [],
        }
      }

      if (row.product_id) {
        acc[orderId].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_slug: row.product_slug,
          category_name: row.category_name,
          quantity: Number.parseInt(row.quantity) || 1,
          unit_price: Number.parseFloat(row.unit_price),
          total_price: Number.parseFloat(row.unit_price) * (Number.parseInt(row.quantity) || 1),
          is_flash_sale: Boolean(row.is_flash_sale),
          flash_sale_discount_percent: row.flash_sale_discount_percent || 0,
          original_price: row.original_price ? Number.parseFloat(row.original_price) : null,
          savings_amount: row.savings_amount ? Number.parseFloat(row.savings_amount) : 0,
          account_email: row.account_email,
          account_password: row.account_password,
        })
      }

      return acc
    }, {})

    return NextResponse.json({
      orders: Object.values(groupedOrders),
      pagination: {
        limit,
        offset,
        total: Object.keys(groupedOrders).length,
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, items } = body

    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["type", "items"],
        },
        { status: 400 },
      )
    }

    // Start transaction using query instead of execute
    await db.query("START TRANSACTION")

    try {
      let totalAmount = 0
      const orderItems = []
      const now = new Date()

      // Validate and calculate each item
      for (const item of items) {
        const { product_id, quantity = 1 } = item

        if (!product_id) {
          throw new Error("Product ID is required for each item")
        }

        // Get product with current stock from premium_accounts
        const [productRows] = await db.execute(
          `
          SELECT 
            p.*,
            c.name AS category_name,
            c.slug AS category_slug,
            (
              SELECT COUNT(*) 
              FROM premium_accounts pa 
              WHERE pa.product_id = p.id AND pa.status = 'available'
            ) AS available_stock,
            GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS images
          FROM premium_products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN product_images pi ON p.id = pi.product_id
          WHERE p.id = ? AND p.status = 'active'
          GROUP BY p.id
        `,
          [product_id],
        )

        const product = (productRows as any[])[0]
        if (!product) {
          throw new Error(`Product with ID ${product_id} not found or inactive`)
        }

        const availableStock = Number.parseInt(product.available_stock) || 0
        if (availableStock < quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${quantity}`,
          )
        }

        // Check if flash sale is active
        const isFlashSaleActive =
          product.is_flash_sale &&
          product.flash_sale_start &&
          product.flash_sale_end &&
          new Date(product.flash_sale_start) <= now &&
          new Date(product.flash_sale_end) >= now

        // Calculate pricing
        let unitPrice: number
        let originalPrice: number | null = null
        let savingsAmount = 0
        let flashSaleDiscountPercent = 0
        let isFlashSale = false

        if (isFlashSaleActive && user.role !== "reseller") {
          // Apply flash sale price for regular users
          isFlashSale = true
          flashSaleDiscountPercent = product.flash_sale_discount_percent || 0
          originalPrice = Number.parseFloat(product.user_price)
          unitPrice = Math.round(originalPrice * (1 - flashSaleDiscountPercent / 100))
          savingsAmount = (originalPrice - unitPrice) * quantity
        } else if (user.role === "reseller") {
          // Reseller gets special price regardless of flash sale
          unitPrice = Number.parseFloat(product.reseller_price)
          originalPrice = Number.parseFloat(product.user_price)
          savingsAmount = (originalPrice - unitPrice) * quantity
        } else {
          // Regular price for normal users when no flash sale
          unitPrice = Number.parseFloat(product.user_price)
          if (product.fake_price && Number.parseFloat(product.fake_price) > unitPrice) {
            originalPrice = Number.parseFloat(product.fake_price)
            savingsAmount = (originalPrice - unitPrice) * quantity
          }
        }

        const itemTotal = unitPrice * quantity
        totalAmount += itemTotal

        orderItems.push({
          product_id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          total_price: itemTotal,
          is_flash_sale: isFlashSale,
          flash_sale_discount_percent: flashSaleDiscountPercent,
          original_price: originalPrice,
          savings_amount: savingsAmount,
          product: {
            ...product,
            images: product.images ? product.images.split(",") : [],
            features: isValidJSON(product.features) ? JSON.parse(product.features) : [],
            tips: isValidJSON(product.tips) ? JSON.parse(product.tips) : [],
            available_stock: availableStock,
          },
        })
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Calculate expiry time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Create Xendit invoice first
      const invoiceData = {
        external_id: orderNumber,
        amount: totalAmount,
        description: `Order ${orderNumber} - ${orderItems.map((item) => `${item.quantity}x ${item.product_name}`).join(", ")}`,
        invoice_duration: 3600, // 1 hour in seconds
        customer: {
          given_names: user.name,
          email: user.email,
        },
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order=${orderNumber}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order=${orderNumber}`,
        currency: "IDR",
        items: orderItems.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          category: item.product.category_name || "Digital Product",
        })),
        customer_notification_preference: {
          invoice_created: ["email"],
          invoice_reminder: ["email"],
          invoice_paid: ["email"],
          invoice_expired: ["email"],
        },
      }

      const invoice = await xenditService.createInvoice(invoiceData)

      // Create order
      const [orderResult] = await db.execute(
        `
        INSERT INTO orders (
          user_id, order_number, type, total_amount, status, 
          payment_status, payment_method, xendit_invoice_id, xendit_invoice_url,
          expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending', 'pending', 'xendit', ?, ?, ?, NOW(), NOW())
      `,
        [user.id, orderNumber, type, totalAmount, invoice.id, invoice.invoice_url, expiresAt],
      )

      const orderId = (orderResult as any).insertId

      // Create order items and reserve accounts
      for (const item of orderItems) {
        // Insert order item using existing order_premium_items table
        await db.execute(
          `
          INSERT INTO order_premium_items (
            order_id, product_id, quantity, price,
            is_flash_sale, flash_sale_discount_percent, original_price, savings_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.is_flash_sale ? 1 : 0,
            item.flash_sale_discount_percent,
            item.original_price,
            item.savings_amount,
          ],
        )

        // Reserve premium accounts (change status from 'available' to 'reserved')
       await db.execute(
  `
  UPDATE premium_accounts 
  SET status = 'reserved', reserved_for_order_id = ?, updated_at = NOW()
  WHERE product_id = ? AND status = 'available' 
  LIMIT ${item.quantity}
`,
  [orderId, item.product_id],
)


        // Verify that accounts were actually reserved
        const [reservedCheck] = await db.execute(
          `
          SELECT COUNT(*) as reserved_count 
          FROM premium_accounts 
          WHERE product_id = ? AND status = 'reserved' AND reserved_for_order_id = ?
        `,
          [item.product_id, orderId],
        )

        const reservedCount = (reservedCheck as any[])[0]?.reserved_count || 0
        if (reservedCount < item.quantity) {
          throw new Error(
            `Failed to reserve sufficient accounts for ${item.product_name}. Reserved: ${reservedCount}, Required: ${item.quantity}`,
          )
        }

        // Track flash sale analytics if applicable
        if (item.is_flash_sale) {
          await db.execute(
            `
            INSERT INTO flash_sale_orders (
              order_id, product_id, quantity, original_price, 
              flash_sale_price, discount_percent, savings_amount,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
            [
              orderId,
              item.product_id,
              item.quantity,
              item.original_price,
              item.unit_price,
              item.flash_sale_discount_percent,
              item.savings_amount,
            ],
          )
        }
      }

      // Commit transaction using query instead of execute
      await db.query("COMMIT")

      // Prepare response
      const totalSavings = orderItems.reduce((sum, item) => sum + item.savings_amount, 0)
      const hasFlashSale = orderItems.some((item) => item.is_flash_sale)

      console.log(`✅ Order created successfully: ${orderNumber}, expires at: ${expiresAt.toISOString()}`)

      return NextResponse.json({
        success: true,
        message: "Order created successfully",
        order: {
          id: orderId,
          order_number: orderNumber,
          type,
          total_amount: totalAmount,
          total_savings: totalSavings,
          status: "pending",
          payment_status: "pending",
          payment_method: "xendit",
          payment_url: invoice.invoice_url,
          expires_at: expiresAt.toISOString(),
          minutes_until_expiry: 60,
          has_flash_sale: hasFlashSale,
          can_cancel: true,
          items: orderItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            is_flash_sale: item.is_flash_sale,
            flash_sale_discount_percent: item.flash_sale_discount_percent,
            original_price: item.original_price,
            savings_amount: item.savings_amount,
          })),
        },
        invoice: {
          id: invoice.id,
          url: invoice.invoice_url,
          amount: invoice.amount,
          status: invoice.status,
          expires_at: invoice.expiry_date,
        },
      })
    } catch (transactionError) {
      // Rollback transaction on error using query instead of execute
      await db.query("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Create order error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
