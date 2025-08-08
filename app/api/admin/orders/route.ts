import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { xenditService } from "@/lib/xendit"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get premium account orders using your actual table structure
    const [premiumOrders] = await db.execute(
      `SELECT 
        o.id,
        o.order_number,
        'premium_account' as type,
        o.total_amount,
        o.status,
        CASE 
          WHEN o.status = 'pending' AND o.expires_at IS NOT NULL AND o.expires_at <= NOW() THEN 'expired'
          ELSE o.status
        END as display_status,
        o.payment_method,
        o.payment_status,
        o.xendit_invoice_url,
        o.expires_at,
        CASE 
          WHEN o.expires_at IS NULL THEN NULL
          WHEN o.expires_at <= NOW() THEN 0
          ELSE TIMESTAMPDIFF(MINUTE, NOW(), o.expires_at)
        END as minutes_until_expiry,
        o.auto_cancelled_at,
        o.cancellation_reason,
        o.created_at,
        o.updated_at,
        CASE 
          WHEN o.status = 'pending' 
            AND o.expires_at IS NOT NULL 
            AND o.expires_at > NOW() 
            AND o.auto_cancelled_at IS NULL 
          THEN true
          ELSE false
        END as can_cancel
       FROM orders o
       WHERE o.user_id = ? AND o.type = 'premium_account'
       ORDER BY o.created_at DESC`,
      [user.id],
    )

    // Get social media orders
    const [socialOrders] = await db.execute(
      `SELECT 
        so.id,
        so.order_number,
        'social_media' as type,
        so.total_amount,
        so.status,
        CASE 
          WHEN so.status = 'pending' AND so.expires_at IS NOT NULL AND so.expires_at <= NOW() THEN 'expired'
          ELSE so.status
        END as display_status,
        'xendit' as payment_method,
        so.payment_status,
        '' as xendit_invoice_url,
        so.expires_at,
        CASE 
          WHEN so.expires_at IS NULL THEN NULL
          WHEN so.expires_at <= NOW() THEN 0
          ELSE TIMESTAMPDIFF(MINUTE, NOW(), so.expires_at)
        END as minutes_until_expiry,
        so.auto_cancelled_at,
        so.cancellation_reason,
        so.created_at,
        so.updated_at,
        CASE 
          WHEN so.status = 'pending' 
            AND so.expires_at IS NOT NULL 
            AND so.expires_at > NOW() 
            AND so.auto_cancelled_at IS NULL 
          THEN true
          ELSE false
        END as can_cancel
       FROM social_orders so
       WHERE so.user_id = ?
       ORDER BY so.created_at DESC`,
      [user.id],
    )

    // Combine all orders
    const allOrders = [...(premiumOrders as any[]), ...(socialOrders as any[])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    // Paginate combined results
    const paginatedOrders = allOrders.slice(offset, offset + limit)

    // Get order items for each order using your actual table structure
    const ordersWithItems = await Promise.all(
      paginatedOrders.map(async (order) => {
        let items = []

        if (order.type === "premium_account") {
          const [orderItems] = await db.execute(
            `SELECT 
              opi.*,
              pp.name as product_name,
              pp.slug as product_slug,
              c.name as category_name,
              opi.account_email,
              opi.account_password,
              opi.price as unit_price,
              opi.price as total_price
             FROM order_premium_items opi
             JOIN premium_products pp ON opi.product_id = pp.id
             JOIN categories c ON pp.category_id = c.id
             WHERE opi.order_id = ?`,
            [order.id],
          )
          items = (orderItems as any[]).map(item => ({
            ...item,
            is_flash_sale: item.is_flash_sale || false,
            flash_sale_discount_percent: item.flash_sale_discount_percent || 0,
            savings_amount: item.savings_amount || 0
          }))
        } else if (order.type === "social_media") {
          const [socialOrderDetails] = await db.execute(
            `SELECT 
              so.service_id as product_id,
              ss.name as product_name,
              ss.name as product_slug,
              sc.name as category_name,
              so.quantity,
              (so.total_amount / so.quantity) as unit_price,
              so.total_amount as total_price,
              false as is_flash_sale,
              0 as flash_sale_discount_percent,
              NULL as original_price,
              0 as savings_amount,
              NULL as account_email,
              NULL as account_password
             FROM social_orders so
             JOIN social_services ss ON so.service_id = ss.id
             JOIN social_categories sc ON ss.category_id = sc.id
             WHERE so.id = ?`,
            [order.id],
          )
          items = socialOrderDetails as any[]
        }

        return {
          ...order,
          items,
        }
      }),
    )

    return NextResponse.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total: allOrders.length,
        pages: Math.ceil(allOrders.length / limit),
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
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    // Start transaction
    await db.execute("START TRANSACTION")

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      // Calculate expiry time (15 minutes from now)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      // Calculate total amount and validate items
      let totalAmount = 0
      const validatedItems = []

      for (const item of items) {
        // Use your actual premium_products table
        const [productRows] = await db.execute(
          "SELECT * FROM premium_products WHERE id = ? AND status = 'active'",
          [item.product_id]
        )
        const products = productRows as any[]
        
        if (products.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found or inactive`)
        }

        const product = products[0]
        
        // Check available stock using your actual premium_accounts table
        const [stockRows] = await db.execute(
          "SELECT COUNT(*) as available_count FROM premium_accounts WHERE product_id = ? AND status = 'available'",
          [product.id]
        )
        const stockData = stockRows as any[]
        const availableStock = stockData[0].available_count

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`)
        }

        // Calculate price (with flash sale if applicable)
        let unitPrice = product.user_price
        let originalPrice = product.user_price
        let isFlashSale = false
        let flashSaleDiscountPercent = 0
        let savingsAmount = 0

        // Check for active flash sale
        if (product.is_flash_sale && product.flash_sale_discount_percent > 0) {
          const now = new Date()
          const flashSaleStart = product.flash_sale_start ? new Date(product.flash_sale_start) : null
          const flashSaleEnd = product.flash_sale_end ? new Date(product.flash_sale_end) : null

          if ((!flashSaleStart || now >= flashSaleStart) && (!flashSaleEnd || now <= flashSaleEnd)) {
            const discountAmount = (originalPrice * product.flash_sale_discount_percent) / 100
            unitPrice = originalPrice - discountAmount
            isFlashSale = true
            flashSaleDiscountPercent = product.flash_sale_discount_percent
            savingsAmount = discountAmount * item.quantity
          }
        }

        const itemTotal = unitPrice * item.quantity
        totalAmount += itemTotal

        validatedItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: itemTotal,
          is_flash_sale: isFlashSale,
          flash_sale_discount_percent: flashSaleDiscountPercent,
          original_price: isFlashSale ? originalPrice : null,
          savings_amount: savingsAmount
        })
      }

      console.log("💰 Order calculation:", {
        orderNumber,
        totalAmount,
        itemCount: validatedItems.length,
        expiresAt: expiresAt.toISOString()
      })

      // Create Xendit invoice
      console.log("🔄 Creating Xendit invoice...")
      const xenditInvoice = await xenditService.createInvoice({
        external_id: orderNumber,
        amount: totalAmount,
        description: `Premium Account Order - ${orderNumber}`,
        invoice_duration: 900, // 15 minutes
        customer: {
          given_names: user.name || user.email,
          email: user.email,
        },
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order=${orderNumber}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order=${orderNumber}`,
      })

      console.log("✅ Xendit invoice created:", {
        invoiceId: xenditInvoice.id,
        invoiceUrl: xenditInvoice.invoice_url,
        amount: xenditInvoice.amount
      })

      // Create order in database using your actual table structure
      const [orderResult] = await db.execute(
        `INSERT INTO orders (
          user_id, order_number, type, total_amount, status, payment_method, payment_status,
          xendit_invoice_id, xendit_invoice_url, expires_at, created_at, updated_at
        ) VALUES (?, ?, 'premium_account', ?, 'pending', 'xendit', 'pending', ?, ?, ?, NOW(), NOW())`,
        [user.id, orderNumber, totalAmount, xenditInvoice.id, xenditInvoice.invoice_url, expiresAt]
      )

      const orderId = (orderResult as any).insertId

      // Reserve accounts for each item using your actual table structure
      for (const item of validatedItems) {
        // Get available accounts for this product
        const [accountRows] = await db.execute(
          "SELECT id, email, password FROM premium_accounts WHERE product_id = ? AND status = 'available' LIMIT ?",
          [item.product_id, item.quantity]
        )
        const accounts = accountRows as any[]

        if (accounts.length < item.quantity) {
          throw new Error(`Insufficient accounts available for ${item.product_name}`)
        }

        // Reserve the accounts
        const accountIds = accounts.map(acc => acc.id)
        await db.execute(
          `UPDATE premium_accounts SET status = 'reserved', reserved_for_order_id = ?, updated_at = NOW() 
           WHERE id IN (${accountIds.map(() => '?').join(',')})`,
          [orderId, ...accountIds]
        )

        // Create order items using your actual table structure
        for (let i = 0; i < item.quantity; i++) {
          await db.execute(
            `INSERT INTO order_premium_items (
              order_id, product_id, account_id, quantity, price,
              account_email, account_password,
              is_flash_sale, flash_sale_discount_percent, original_price, savings_amount,
              created_at
            ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              orderId,
              item.product_id,
              accountIds[i],
              item.unit_price,
              accounts[i].email,
              accounts[i].password,
              item.is_flash_sale,
              item.flash_sale_discount_percent,
              item.original_price,
              item.savings_amount / item.quantity // Per item savings
            ]
          )
        }
      }

      // Commit transaction
      await db.execute("COMMIT")

      console.log("✅ Order created successfully:", {
        orderNumber,
        orderId,
        totalAmount,
        expiresAt: expiresAt.toISOString()
      })

      // Return success response with payment URL
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          payment_url: xenditInvoice.invoice_url,
          expires_at: expiresAt.toISOString()
        },
        redirect_url: `/payment/pending?order=${orderNumber}`
      })

    } catch (error) {
      // Rollback transaction on error
      await db.execute("ROLLBACK")
      throw error
    }

  } catch (error) {
    console.error("💥 Order creation error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create order",
        details: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}
