import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const [rows] = await db.execute(
      `SELECT 
        oii.*,
        o.order_number,
        u.name as user_name,
        u.email as user_email,
        s.name as service_name,
        s.category as service_category
      FROM order_indosmm_items oii
      JOIN orders o ON oii.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE o.status IN ('paid', 'processing', 'completed')
      ORDER BY oii.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset],
    )

    return NextResponse.json({ orders: rows })
  } catch (error) {
    console.error("Get IndoSMM orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
