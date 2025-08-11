import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const orderNumber = params.orderNumber

  
    const [orderRows] = await db.execute("SELECT * FROM orders WHERE order_number = ? AND user_id = ?", [
      orderNumber,
      user.id,
    ])

    const orders = orderRows as any[]
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0]

    // Get order items based on type
    const orderDetails: any = {}

    if (order.type === "premium_account") {
      const [premiumItems] = await db.execute(
        `
        SELECT opi.*, p.name as product_name
        FROM order_premium_items opi
        JOIN premium_products p ON opi.product_id = p.id
        WHERE opi.order_id = ?
      `,
        [order.id],
      )

      orderDetails.premium_accounts = (premiumItems as any[]).map((item) => ({
        product_name: item.product_name,
        account_email: item.account_email,
        account_password: item.account_password,
      }))
    } else if (order.type === "indosmm_service") {
      const [indosmmItems] = await db.execute(
        `
        SELECT oii.*, s.name as service_name
        FROM order_indosmm_items oii
        JOIN indosmm_services s ON oii.service_id = s.id
        WHERE oii.order_id = ?
      `,
        [order.id],
      )

      orderDetails.indosmm_orders = (indosmmItems as any[]).map((item) => ({
        service_name: item.service_name,
        target: item.target,
        quantity: item.quantity,
        indosmm_order_id: item.indosmm_order_id,
        indosmm_status: item.indosmm_status,
      }))
    }

    return NextResponse.json({
      order: {
        ...order,
        ...orderDetails,
      },
    })
  } catch (error) {
    console.error("Get order details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
