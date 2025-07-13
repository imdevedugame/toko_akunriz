import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")

    let query = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS images,
        COUNT(a.id) AS stock
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN premium_accounts a ON a.product_id = p.id AND a.status = 'available'
      WHERE p.status = 'active'
    `
    const params: any[] = []

    if (category) {
      query += " AND c.slug = ?"
      params.push(category)
    }

    if (featured) {
      query += " AND p.featured = 1"
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`

   

    const [rows] = await db.execute(query, params)

    const products = (rows as any[]).map((product) => ({
      ...product,
      images: product.images ? product.images.split(",") : [],
      features: parseSafeJSON(product.features),
      tips: parseSafeJSON(product.tips),
    }))

    // Total count untuk pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `
    const countParams: any[] = []

    if (category) {
      countQuery += " AND c.slug = ?"
      countParams.push(category)
    }

    if (featured) {
      countQuery += " AND p.featured = 1"
    }

    if (search) {
      countQuery += " AND (p.name LIKE ? OR p.description LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }


    const [countRows] = await db.execute(countQuery, countParams)
    const total = (countRows as any[])[0]?.total || 0

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("🔥 Get products error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    )
  }
}

// Fungsi parseSafeJSON sudah aman, bisa terima string atau object
function parseSafeJSON(value: any) {
  if (!value) return []
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
  if (typeof value === "object") {
    return value
  }
  return []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category_id, features, tips, featured, status, slug, user_price, reseller_price } = body

    if (!slug) {
      return NextResponse.json({ error: "Missing product slug" }, { status: 400 })
    }

    if (reseller_price === undefined) {
      return NextResponse.json({ error: "Missing reseller_price" }, { status: 400 })
    }

    const [result] = await db.execute(
      `INSERT INTO premium_products (name, slug, description, category_id, features, tips, featured, status, user_price, reseller_price, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        slug,
        description,
        category_id,
        JSON.stringify(features || []),
        JSON.stringify(tips || []),
        featured ? 1 : 0,
        status || "active",
        user_price ?? 0,
        reseller_price,
      ]
    )

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, category_id, features, tips, featured, status } = body

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 })
    }

    await db.execute(
      `UPDATE premium_products SET name=?, description=?, category_id=?, features=?, tips=?, featured=?, status=?
       WHERE id=?`,
      [
        name,
        description,
        category_id,
        JSON.stringify(features || []),
        JSON.stringify(tips || []),
        featured ? 1 : 0,
        status || "active",
        id,
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 })
    }

    await db.execute(`DELETE FROM premium_products WHERE id=?`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}
