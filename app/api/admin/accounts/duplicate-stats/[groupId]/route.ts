import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get detailed stats for specific duplicate group
    const [statsRows] = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold
      FROM premium_accounts 
      WHERE duplicate_group_id = ?
    `,
      [params.groupId],
    )

    const [duplicateRows] = await db.query(
      `
      SELECT id, status, duplicate_index, sold_at
      FROM premium_accounts 
      WHERE duplicate_group_id = ?
      ORDER BY duplicate_index
    `,
      [params.groupId],
    )

    const stats = (statsRows as any[])[0]
    stats.duplicates = duplicateRows

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get duplicate group stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
