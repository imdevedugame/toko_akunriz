import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

// Fungsi aman untuk parse JSON
function safeJsonParse(str: string | null): any[] {
  if (!str || typeof str !== "string") return []
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || "all"

    const offset = (page - 1) * limit

    // Build WHERE clause
    const whereConditions = []
    const queryParams: any[] = []

    if (search) {
      whereConditions.push("(p.name LIKE ? OR p.slug LIKE ? OR c.name LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      whereConditions.push("p.status = ?")
      queryParams.push(status)
    }

    if (category !== "all") {
      whereConditions.push("p.category_id = ?")
      queryParams.push(category)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Query total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `
    const [countResult] = await db.query(countQuery, queryParams)
    const totalProducts = (countResult as any[])[0]?.total || 0
    const totalPages = Math.ceil(totalProducts / limit)

    // Query data produk
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ${whereClause}
      GROUP BY p.id 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `
    const [rows] = await db.query(productsQuery, [...queryParams, limit, offset])

    // Map hasil produk
    const products = (rows as any[]).map((product) => ({
      ...product,
      images: product.images ? product.images.split(",") : [],
      features: safeJsonParse(product.features),
      tips: safeJsonParse(product.tips),
      featured: Boolean(product.featured),
    }))

    const pagination = {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      itemsPerPage: limit,
    }

    return NextResponse.json({
      products,
      pagination,
    })
  } catch (error) {
    console.error("Get admin products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
