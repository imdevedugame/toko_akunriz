import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

interface RouteContext {
  params: Promise<{ orderNumber: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { params } = context
    const { orderNumber } = await params

    // Get order details with service information
    const [orderRows] = await db.execute(
      `SELECT o.*, 
        s.name as service_name,
        s.category as service_category,
        s.image_url as service_image,
        oii.target,
        oii.quantity,
        oii.indosmm_order_id,
        oii.indosmm_status,
        oii.start_count,
        oii.remains
      FROM orders o
      JOIN order_indosmm_items oii ON o.id = oii.order_id
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE o.order_number = ? AND o.user_id = ? AND o.type = 'indosmm_service'`,
      [orderNumber, user.id],
    )

    const orders = orderRows as any[]
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0]

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get IndoSMM order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
