import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get duplicate stats for all groups
    const [rows] = await db.query(`
      SELECT 
        duplicate_group_id,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold
      FROM premium_accounts 
      WHERE duplicate_group_id IS NOT NULL
      GROUP BY duplicate_group_id
    `)

    const stats: Record<string, any> = {}
    ;(rows as any[]).forEach((row) => {
      stats[row.duplicate_group_id] = {
        total: row.total,
        available: row.available,
        reserved: row.reserved,
        sold: row.sold,
      }
    })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get duplicate stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
