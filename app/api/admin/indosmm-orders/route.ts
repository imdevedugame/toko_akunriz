import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // ✅ Autentikasi admin
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Ambil parameter limit & offset dari URL
    const { searchParams } = new URL(request.url)
    let limit = Number.parseInt(searchParams.get("limit") || "50")
    let offset = Number.parseInt(searchParams.get("offset") || "0")

    // ✅ Validasi default
    limit = Number.isNaN(limit) || limit < 1 ? 50 : limit
    offset = Number.isNaN(offset) || offset < 0 ? 0 : offset

    const [rows] = await db.execute(
  `SELECT 
    oii.*,
    o.order_number,
    u.name AS user_name,
    u.email AS user_email,
    s.name AS service_name,
    s.category AS service_category
  FROM order_indosmm_items oii
  JOIN orders o ON oii.order_id = o.id
  JOIN users u ON o.user_id = u.id
  JOIN indosmm_services s ON oii.service_id = s.id
  WHERE o.status IN ('paid', 'processing', 'completed')
  ORDER BY oii.created_at DESC
  LIMIT ${limit} OFFSET ${offset}`
)


    return NextResponse.json({ orders: rows })
  } catch (error) {
    console.error("Get IndoSMM orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
