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

    // Ensure limit and offset are safe integers
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 50
    const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0

    const [rows] = await db.execute(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id 
      ORDER BY p.created_at DESC 
      LIMIT ${safeLimit} OFFSET ${safeOffset}`
    )

    const products = (rows as any[]).map((product) => ({
      ...product,
      images: product.images ? product.images.split(",") : [],
      features:
        typeof product.features === "string" && product.features.trim() !== ""
          ? JSON.parse(product.features)
          : [],
      tips:
        typeof product.tips === "string" && product.tips.trim() !== ""
          ? JSON.parse(product.tips)
          : [],
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Get admin products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
