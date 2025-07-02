import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { xenditService } from "@/lib/xendit"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { service_id, target, quantity, notes } = await request.json()

    console.log("🛒 Creating IndoSMM order:", {
      userId: user.id,
      serviceId: service_id,
      target: target.substring(0, 50) + (target.length > 50 ? "..." : ""),
      quantity,
      userRole: user.role,
    })

    // Get service details
    const [serviceRows] = await db.execute("SELECT * FROM indosmm_services WHERE id = ? AND status = 'active'", [
      service_id,
    ])

    const services = serviceRows as any[]
    if (services.length === 0) {
      console.error("❌ Service not found or inactive:", service_id)
      return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 })
    }

    const service = services[0]
    console.log("📋 Service details:", {
      id: service.id,
      name: service.name,
      category: service.category,
      serviceId: service.service_id,
      userRate: service.user_rate,
      resellerRate: service.reseller_rate,
    })

    // Validate quantity
    if (quantity < service.min_order || quantity > service.max_order) {
      console.error("❌ Invalid quantity:", {
        quantity,
        minOrder: service.min_order,
        maxOrder: service.max_order,
      })
      return NextResponse.json(
        { error: `Quantity must be between ${service.min_order} and ${service.max_order}` },
        { status: 400 },
      )
    }

    // Calculate price based on user role
    const rate = user.role === "reseller" ? service.reseller_rate : service.user_rate
    const totalPrice = Math.round((rate * quantity) / 1000)

    console.log("💰 Price calculation:", {
      userRole: user.role,
      rate,
      quantity,
      totalPrice,
    })

    // Generate order number
    const orderNumber = `INDOSMM-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create order in database
    const [orderResult] = await db.execute(
      `INSERT INTO orders 
       (user_id, order_number, type, status, total_amount, created_at) 
       VALUES (?, ?, 'indosmm_service', 'pending', ?, NOW())`,
      [user.id, orderNumber, totalPrice],
    )

    const orderId = (orderResult as any).insertId
    console.log("📝 Order created:", { orderId, orderNumber })

    // Create order item with correct IndoSMM service_id mapping
  await db.execute(
  `INSERT INTO order_indosmm_items 
   (order_id, service_id, service_name, target, quantity, price, notes) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [orderId, service.id, service.name, target, quantity, totalPrice, notes || null]
)




    console.log("📦 Order item created for IndoSMM service:", {
      orderId,
      indoSMMServiceId: service.service_id,
      serviceName: service.name,
    })

    // Create Xendit invoice
    try {
      const invoice = await xenditService.createInvoice({
  external_id: orderNumber,
  amount: totalPrice > 0 ? totalPrice : 10000, // Pastikan > 0
  description: `IndoSMM Service: ${service.name}`,
  customer: {
    given_names: user.name,
    email: user.email,
  },
  invoice_duration: 3600, // 1 jam
  success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/indosmm-success?order=${orderNumber}`,
  failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order=${orderNumber}`,
})


      console.log("💳 Xendit invoice created:", {
        invoiceId: invoice.id,
        amount: invoice.amount,
        status: invoice.status,
        orderNumber,
      })

      // Update order with payment info
      await db.execute("UPDATE orders SET payment_id = ?, payment_url = ? WHERE id = ?", [
        invoice.id,
        invoice.invoice_url,
        orderId,
      ])

      console.log("✅ IndoSMM order creation completed successfully")
      console.log("🎯 Order will be automatically submitted to IndoSMM after payment confirmation")

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          order_number: orderNumber,
          total_amount: totalPrice,
          payment_url: invoice.invoice_url,
          payment_id: invoice.id,
        },
      })
    } catch (paymentError) {
      console.error("💥 Payment creation failed:", paymentError)

      // Update order status to failed
      await db.execute("UPDATE orders SET status = 'failed' WHERE id = ?", [orderId])

      return NextResponse.json({ error: "Failed to create payment. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("💥 IndoSMM order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("📋 Fetching IndoSMM orders for user:", {
      userId: user.id,
      limit,
      offset,
    })

    // Get orders with IndoSMM items
    const [rows] = await db.execute(
      `SELECT 
  o.id, o.order_number, o.status, o.total_amount, o.created_at, o.updated_at,
  oi.service_name, oi.target, oi.quantity, oi.price AS rate, oi.price AS total_price, oi.notes,
  oi.indosmm_order_id, oi.indosmm_status, oi.start_count, oi.remains
FROM orders o
JOIN order_indosmm_items oi ON o.id = oi.order_id
WHERE o.user_id = ? AND o.type = 'indosmm_service'
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [user.id, limit, offset],
    )

    // Get total count
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND type = 'indosmm'",
      [user.id],
    )

    const total = (countRows as any[])[0]?.total || 0

    console.log(`✅ Retrieved ${(rows as any[]).length} IndoSMM orders (total: ${total})`)

    return NextResponse.json({
      orders: rows,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("💥 Get IndoSMM orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
