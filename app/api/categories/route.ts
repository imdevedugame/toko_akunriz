import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCount = searchParams.get("include_count") === "true"

    let query = "SELECT * FROM categories ORDER BY name ASC"

    if (includeCount) {
      query = `
        SELECT 
          c.*,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN premium_products p ON c.id = p.category_id AND p.status = 'active'
        GROUP BY c.id
        ORDER BY c.name ASC
      `
    }

    const [rows] = await db.execute(query)

    return NextResponse.json({
      categories: rows,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
