import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { indoSMMService } from "@/lib/indosmm"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all pending/processing orders
    const [itemRows] = await db.execute(
      `SELECT * FROM order_indosmm_items 
       WHERE indosmm_order_id IS NOT NULL 
       AND indosmm_status NOT IN ('completed', 'canceled', 'cancelled')
       ORDER BY created_at DESC
       LIMIT 50`,
    )

    const items = itemRows as any[]
    let refreshedCount = 0
    let errorCount = 0

    for (const item of items) {
      try {
        // Get status from IndoSMM
        const status = await indoSMMService.getOrderStatus(item.indosmm_order_id)

        // Update order item
        await db.execute(
          `UPDATE order_indosmm_items 
           SET indosmm_status = ?, start_count = ?, remains = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status.status, status.start_count || 0, status.remains || 0, item.id],
        )

        refreshedCount++

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (indoSMMError) {
        console.error(`IndoSMM API error for order ${item.indosmm_order_id}:`, indoSMMError)
        errorCount++
      }
    }

    return NextResponse.json({
      message: "Bulk refresh completed",
      refreshed: refreshedCount,
      errors: errorCount,
      total: items.length,
    })
  } catch (error) {
    console.error("Bulk refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
