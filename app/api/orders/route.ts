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
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT o.*, 
        CASE 
          WHEN o.type = 'premium_account' THEN 
            (SELECT JSON_OBJECT(
              'product_name', p.name,
              'account_email', opi.account_email,
              'account_password', opi.account_password
            ) FROM order_premium_items opi 
            JOIN premium_products p ON opi.product_id = p.id 
            WHERE opi.order_id = o.id LIMIT 1)
          WHEN o.type = 'indosmm_service' THEN
            (SELECT JSON_OBJECT(
              'service_name', s.name,
              'target', oii.target,
              'quantity', oii.quantity,
              'indosmm_order_id', oii.indosmm_order_id,
              'indosmm_status', oii.indosmm_status
            ) FROM order_indosmm_items oii
            JOIN indosmm_services s ON oii.service_id = s.id
            WHERE oii.order_id = o.id LIMIT 1)
        END as order_details
      FROM orders o
      WHERE o.user_id = ?
    `

    const params: any[] = [user.id]

    if (type) {
      query += " AND o.type = ?"
      params.push(type)
    }

    // Interpolate LIMIT and OFFSET directly into the query string
    query += ` ORDER BY o.created_at DESC LIMIT ${Number.isFinite(limit) ? limit : 10} OFFSET ${Number.isFinite(offset) ? offset : 0}`

    const [rows] = await db.execute(query, params)
    const orders = (rows as any[]).map((order) => ({
      ...order,
      order_details: order.order_details ?? null,
    }))

    return NextResponse.json({ orders })
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

    const { type, items } = await request.json()

    if (!type || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${user.id}`

    // Calculate total amount
    let totalAmount = 0

    if (type === "premium_account") {
      for (const item of items) {
        const [productRows] = await db.execute("SELECT user_price, reseller_price FROM premium_products WHERE id = ?", [
          item.product_id,
        ])
        const products = productRows as any[]
        if (products.length === 0) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
        const price = user.role === "reseller" ? products[0].reseller_price : products[0].user_price
        totalAmount += price * (item.quantity || 1)
      }
    } else if (type === "indosmm_service") {
      for (const item of items) {
        const [serviceRows] = await db.execute("SELECT user_rate, reseller_rate FROM indosmm_services WHERE id = ?", [
          item.service_id,
        ])
        const services = serviceRows as any[]
        if (services.length === 0) {
          return NextResponse.json({ error: "Service not found" }, { status: 404 })
        }
        const rate = user.role === "reseller" ? services[0].reseller_rate : services[0].user_rate
        totalAmount += (rate * item.quantity) / 1000
      }
    }

    // Create Xendit invoice
    const xenditInvoice = await xenditService.createInvoice({
      external_id: orderNumber,
      amount: totalAmount,
      description: `Order ${orderNumber}`,
      invoice_duration: 86400, // 24 hours
      customer: {
        given_names: user.name,
        email: user.email,
      },
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?order=${orderNumber}`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/failed?order=${orderNumber}`,
    })

    // Create order in database
    const [orderResult] = await db.execute(
      `INSERT INTO orders 
       (user_id, order_number, type, total_amount, xendit_invoice_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, orderNumber, type, totalAmount, xenditInvoice.id],
    )

    const orderId = (orderResult as any).insertId

    // Create order items
    if (type === "premium_account") {
      for (const item of items) {
        const productId = item.product_id
        const [productRows] = await db.execute(
          "SELECT user_price, reseller_price FROM premium_products WHERE id = ?",
          [productId]
        )
        const products = productRows as any[]
        const price = user.role === "reseller" ? products[0].reseller_price : products[0].user_price

        // Ambil akun premium yang tersedia
        const [premiumAccountRows] = await db.execute(
          `SELECT * FROM premium_accounts WHERE product_id = ? AND status = 'available' LIMIT 1`,
          [productId]
        )
        const premiumAccount = (premiumAccountRows as any[])[0]

        if (!premiumAccount) {
          throw new Error("Akun premium tidak tersedia")
        }

        // Buat record di order_premium_items
        await db.execute(
          `INSERT INTO order_premium_items (order_id, product_id, account_id, quantity, price, account_email, account_password, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
        orderId,
        productId,
        premiumAccount.id,
        1,
        price,
        premiumAccount.email,
        premiumAccount.password,
          ]
        )

        // Update status akun agar tidak dipakai lagi
        await db.execute(
          `UPDATE premium_accounts SET status = 'sold', sold_at = NOW(), order_id = ? WHERE id = ?`,
          [orderId, premiumAccount.id]
        )
      }
    } else if (type === "indosmm_service") {
      for (const item of items) {
        const [serviceRows] = await db.execute("SELECT user_rate, reseller_rate FROM indosmm_services WHERE id = ?", [
          item.service_id,
        ])
        const services = serviceRows as any[]
        const rate = user.role === "reseller" ? services[0].reseller_rate : services[0].user_rate
        const price = (rate * item.quantity) / 1000

        await db.execute(
          "INSERT INTO order_indosmm_items (order_id, service_id, target, quantity, price) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.service_id, item.target, item.quantity, price],
        )
      }
    }

    return NextResponse.json({
      message: "Order created successfully",
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        payment_url: xenditInvoice.invoice_url,
      },
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
