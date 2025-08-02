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
    const [orderRows] = await db.execute(
      `
      SELECT 
        so.*,
        ss.name as service_name,
        ss.service_type,
        sc.name as category_name,
        sp.name as package_name,
        u.name as user_name,
        u.email as user_email
      FROM social_orders so
      JOIN social_services ss ON so.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      JOIN users u ON so.user_id = u.id
      LEFT JOIN service_packages sp ON so.package_id = sp.id
      WHERE so.order_number = ? AND (so.user_id = ? OR ? = 'admin')
    `,
      [params.orderNumber, user.id, user.role],
    )

    const orders = orderRows as any[]
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: orders[0] })
  } catch (error) {
    console.error("Failed to fetch social order:", error)
    return NextResponse.json({ error: "Failed to fetch social order" }, { status: 500 })
  }
}
