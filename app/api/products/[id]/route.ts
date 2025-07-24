import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context
    const { id } = await params

    console.log("GET premium product by ID:", id)

    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT COUNT(*) 
          FROM premium_accounts pa 
          WHERE pa.product_id = p.id AND pa.status = 'available'
        ) as stock,
        CASE 
          WHEN p.is_flash_sale = TRUE AND p.flash_sale_discount_percent IS NOT NULL 
          THEN p.user_price * (1 - p.flash_sale_discount_percent / 100.0)
          ELSE NULL 
        END as flash_sale_price,
        CASE 
          WHEN p.is_flash_sale = TRUE 
          AND p.flash_sale_start IS NOT NULL 
          AND p.flash_sale_end IS NOT NULL 
          AND NOW() BETWEEN p.flash_sale_start AND p.flash_sale_end 
          THEN TRUE 
          ELSE FALSE 
        END as is_flash_sale_active
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'
    `

    const products = (await query(sql, [id])) as any[]

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    const processedProduct = {
      ...product,
      images: product.images ? safeJsonParse(product.images) : [],
      features: product.features ? safeJsonParse(product.features) : [],
      tips: product.tips ? safeJsonParse(product.tips) : [],
    }

    function safeJsonParse(jsonString: string) {
      try {
        return JSON.parse(jsonString)
      } catch {
        return []
      }
    }

    return NextResponse.json({ product: processedProduct })
  } catch (error) {
    console.error("Get premium product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context
    const { id } = await params

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

    const existingProductResult = await query("SELECT id FROM premium_products WHERE id = ?", [id])
    const existingProduct = (existingProductResult as any[])[0]

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const slugCheckResult = await query("SELECT id FROM premium_products WHERE slug = ? AND id != ?", [finalSlug, id]);
    const slugCheck = (slugCheckResult as any[])[0];
    if ((slugCheck as any[]).length > 0) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
    }

    await query(
      `UPDATE premium_products SET 
        name = ?, slug = ?, description = ?, category_id = ?, 
        user_price = ?, reseller_price = ?, fake_price = ?, 
        features = ?, tips = ?, featured = ?, status = ?, 
        is_flash_sale = ?, flash_sale_start = ?, flash_sale_end = ?, 
        flash_sale_discount_percent = ?, updated_at = NOW()
      WHERE id = ?`,
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
        id,
      ],
    )

    await query("DELETE FROM product_images WHERE product_id = ?", [id])

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)", [
          id,
          images[i],
          i,
        ])
      }
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        id: Number.parseInt(id),
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
    console.error("Update premium product error:", error)
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

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context
    const { id } = await params

    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingProductResult = await query("SELECT id, name FROM premium_products WHERE id = ?", [id]);
    const existingProduct = (existingProductResult as any[])[0];
    if ((existingProduct as any[]).length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = (existingProduct as any[])[0]

    const orderCheckResult = await query("SELECT COUNT(*) as count FROM order_items WHERE product_id = ?", [id]);
    const orderCheck = (orderCheckResult as any[])[0];
    const orderCount = (orderCheck as any[])[0].count

    if (orderCount > 0) {
      await query("UPDATE premium_products SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id])

      return NextResponse.json({
        message: "Product has existing orders. Product has been marked as inactive instead of deleted.",
        action: "deactivated",
      })
    }

    await query("DELETE FROM product_images WHERE product_id = ?", [id])
    await query("DELETE FROM premium_accounts WHERE product_id = ?", [id])
    await query("DELETE FROM premium_products WHERE id = ?", [id])

    return NextResponse.json({
      message: `Product "${product.name}" deleted successfully`,
      action: "deleted",
    })
  } catch (error) {
    console.error("Delete premium product error:", error)
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
