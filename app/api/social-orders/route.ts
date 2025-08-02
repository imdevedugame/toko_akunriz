import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { xenditService } from "@/lib/xendit"

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

    const query = `
      SELECT 
        so.*,
        ss.name as service_name,
        ss.service_type,
        sc.name as category_name,
        sp.name as package_name
      FROM social_orders so
      LEFT JOIN social_services ss ON so.service_id = ss.id
      LEFT JOIN social_categories sc ON ss.category_id = sc.id
      LEFT JOIN service_packages sp ON so.package_id = sp.id
      WHERE so.user_id = ?
      ORDER BY so.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    const [orderRows] = await db.execute(query, [user.id])
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM social_orders WHERE user_id = ?",
      [user.id]
    )

    const orders = orderRows as any[]
    const totalCount = (countRows as any[])[0].total

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status || "pending",
      created_at: order.created_at,
      order_details: {
        service_name: order.service_name,
        service_type: order.service_type,
        category_name: order.category_name,
        package_name: order.package_name,
        target_url: order.target_url,
        quantity: order.quantity,
        is_custom: Boolean(order.is_custom),
        whatsapp_number: order.whatsapp_number,
        comments: order.notes,
      },
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch social orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { service_id, package_id, quantity, target_url, whatsapp_number, comments, description, is_custom } = body

    if (!service_id || !quantity || !target_url || !whatsapp_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [serviceRows] = await db.execute(
      `
      SELECT ss.*, sc.name as category_name 
      FROM social_services ss 
      JOIN social_categories sc ON ss.category_id = sc.id 
      WHERE ss.id = ? AND ss.status = 'active'
    `,
      [service_id]
    )

    const services = serviceRows as any[]
    if (services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const service = services[0]
    let totalAmount = 0
    let finalQuantity = quantity

    if (package_id && !is_custom) {
      const [packageRows] = await db.execute(
        "SELECT * FROM service_packages WHERE id = ? AND service_id = ?",
        [package_id, service_id]
      )

      const packages = packageRows as any[]
      if (packages.length === 0) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 })
      }

      const servicePackage = packages[0]
      finalQuantity = servicePackage.quantity
      totalAmount = user.role === "reseller" ? servicePackage.price_reseller : servicePackage.price_user
    } else {
      if (quantity < service.min_order || quantity > service.max_order) {
        return NextResponse.json(
          { error: `Quantity must be between ${service.min_order} and ${service.max_order}` },
          { status: 400 }
        )
      }

      const pricePerUnit = user.role === "reseller" ? service.price_reseller : service.price_user
      totalAmount = Math.ceil((quantity / 1000) * pricePerUnit)
    }

    const orderNumber = `SM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const [result] = await db.execute(
      `
      INSERT INTO social_orders (
        order_number, user_id, service_id, package_id, quantity, 
        target_url, whatsapp_number, total_amount, is_custom, notes, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        orderNumber,
        user.id,
        service_id,
        package_id || null,
        finalQuantity,
        target_url,
        whatsapp_number,
        totalAmount,
        is_custom ? 1 : 0,
        comments || null,
        description || null,
      ]
    )

    const insertResult = result as any
    const orderId = insertResult.insertId

    try {
      const invoiceData = {
        external_id: orderNumber,
        amount: totalAmount,
        description: `${service.name} - ${finalQuantity.toLocaleString()} ${service.service_type}`,
        invoice_duration: 86400,
        customer: {
          given_names: user.name,
          email: user.email,
          mobile_number: whatsapp_number,
        },
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/social-success?order=${orderNumber}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order=${orderNumber}`,
      }

      const invoice = await xenditService.createInvoice(invoiceData)

      await db.execute("UPDATE social_orders SET payment_id = ? WHERE id = ?", [invoice.id, orderId])

      return NextResponse.json({
        order_number: orderNumber,
        payment_url: invoice.invoice_url,
        total_amount: totalAmount,
      })
    } catch (paymentError) {
      console.error("Payment creation failed:", paymentError)
      return NextResponse.json({
        order_number: orderNumber,
        total_amount: totalAmount,
        message: "Order created successfully. Payment will be processed manually.",
      })
    }
  } catch (error) {
    console.error("Failed to create social order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
