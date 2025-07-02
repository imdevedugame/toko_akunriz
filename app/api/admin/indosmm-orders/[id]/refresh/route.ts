import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { indoSMMService } from "@/lib/indosmm"
import db from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get order item
    const [itemRows] = await db.execute(
      "SELECT * FROM order_indosmm_items WHERE id = ? AND indosmm_order_id IS NOT NULL",
      [params.id],
    )

    const items = itemRows as any[]
    if (items.length === 0) {
      return NextResponse.json({ error: "Order not found or not submitted to IndoSMM" }, { status: 404 })
    }

    const item = items[0]

    try {
      // Get status from IndoSMM
      const status = await indoSMMService.getOrderStatus(item.indosmm_order_id)

      // Update order item
      await db.execute(
        `UPDATE order_indosmm_items 
         SET indosmm_status = ?, start_count = ?, remains = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status.status, status.start_count || 0, status.remains || 0, params.id],
      )

      return NextResponse.json({
        message: "Order status refreshed successfully",
        status: status.status,
      })
    } catch (indoSMMError) {
      console.error("IndoSMM API error:", indoSMMError)
      return NextResponse.json({ error: "Failed to get status from IndoSMM" }, { status: 500 })
    }
  } catch (error) {
    console.error("Refresh order status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
