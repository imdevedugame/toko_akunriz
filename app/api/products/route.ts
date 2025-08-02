import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")

    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.category_id,
        p.user_price,
        p.reseller_price,
        p.fake_price,
        (
          SELECT COUNT(*) 
          FROM premium_accounts pa 
          WHERE pa.product_id = p.id AND pa.status = 'available'
        ) AS stock,
        p.features,
        p.tips,
        p.featured,
        p.status,
        p.is_flash_sale,
        p.flash_sale_start,
        p.flash_sale_end,
        p.flash_sale_discount_percent,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS images
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.status = 'active'
    `

    const queryParams: any[] = []

    if (category && category !== "all") {
      query += " AND c.slug = ?"
      queryParams.push(category)
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)"
      const searchTerm = `%${search}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (featured === "true") {
      query += " AND p.featured = 1"
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const [rows] = await db.execute(query, queryParams)
    const products = rows as any[]

    const now = new Date()

    const formattedProducts = products.map((product) => {
      const isFlashSaleActive =
        product.is_flash_sale &&
        product.flash_sale_start &&
        product.flash_sale_end &&
        new Date(product.flash_sale_start) <= now &&
        new Date(product.flash_sale_end) >= now

      const displayPrice = isFlashSaleActive && product.flash_sale_discount_percent > 0
        ? Math.round(product.user_price * (1 - product.flash_sale_discount_percent / 100))
        : null

      return {
        ...product,
        images: product.images ? product.images.split(",") : [],
        features: isValidJSON(product.features) ? JSON.parse(product.features) : [],
        tips: isValidJSON(product.tips) ? JSON.parse(product.tips) : [],
        rating: 4.5,
        user_price: Number.parseFloat(product.user_price),
        reseller_price: Number.parseFloat(product.reseller_price),
        fake_price: product.fake_price ? Number.parseFloat(product.fake_price) : null,
        stock: Number.parseInt(product.stock),
        featured: Boolean(product.featured),
        is_flash_sale: Boolean(product.is_flash_sale),
        is_flash_sale_active: isFlashSaleActive,
        flash_sale_price: displayPrice,
        flash_sale_discount_percent: product.flash_sale_discount_percent || 0,
        flash_sale_start: product.flash_sale_start,
        flash_sale_end: product.flash_sale_end,
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        limit,
        offset,
        total: formattedProducts.length,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/products")

    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      category_id,
      user_price,
      reseller_price,
      fake_price,
      features = [],
      tips = [],
      images = [],
      featured = false,
      status = "active",
      is_flash_sale = false,
      flash_sale_start,
      flash_sale_end,
      flash_sale_discount_percent = 0,
    } = body

    if (!name || !description || !category_id || !user_price || !reseller_price) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "description", "category_id", "user_price", "reseller_price"],
        },
        { status: 400 },
      )
    }

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const [slugCheck] = await db.execute("SELECT id FROM premium_products WHERE slug = ?", [finalSlug])
    if ((slugCheck as any[]).length > 0) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
    }

    const [result] = await db.execute(
      `INSERT INTO premium_products 
        (name, slug, description, category_id, user_price, reseller_price, fake_price, 
        features, tips, featured, status, is_flash_sale, flash_sale_start, flash_sale_end, 
        flash_sale_discount_percent, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        finalSlug,
        description,
        category_id,
        user_price,
        reseller_price,
        fake_price || null,
        JSON.stringify(features),
        JSON.stringify(tips),
        featured ? 1 : 0,
        status,
        is_flash_sale ? 1 : 0,
        is_flash_sale && flash_sale_start ? flash_sale_start : null,
        is_flash_sale && flash_sale_end ? flash_sale_end : null,
        is_flash_sale ? flash_sale_discount_percent : 0,
      ],
    )

    const productId = (result as any).insertId

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.execute("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)", [
          productId,
          images[i],
          i,
        ])
      }
    }

    return NextResponse.json({
      message: "Product created successfully",
      product: {
        id: productId,
        name,
        slug: finalSlug,
        description,
        category_id,
        user_price,
        reseller_price,
        fake_price,
        features,
        tips,
        images,
        featured,
        status,
        is_flash_sale,
        flash_sale_start,
        flash_sale_end,
        flash_sale_discount_percent,
      },
    })
  } catch (error) {
    console.error("Create product error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
