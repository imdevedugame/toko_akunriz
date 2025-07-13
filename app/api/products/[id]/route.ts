import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(_: unknown, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context
    const { id } = await params

    const [rows] = await db.execute(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) as images,
        COUNT(a.id) AS stock
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN premium_accounts a ON a.product_id = p.id AND a.status = 'available'
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id`,
      [id],
    )

    const products = rows as any[]
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    function safeParseJSON(str: string | null | undefined) {
      if (!str) return []
      try {
        return JSON.parse(str)
      } catch {
        return []
      }
    }

    const product = {
      ...products[0],
      images: products[0].images ? products[0].images.split(",") : [],
      features: safeParseJSON(products[0].features),
      tips: safeParseJSON(products[0].tips),
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { params } = context
    const { id } = await params

    const { name, slug, description, category_id, user_price, reseller_price, features, tips, images, status } =
      await request.json()

    // Update product tanpa kolom stock (stock dihitung otomatis)
    await db.execute(
      `UPDATE premium_products 
       SET name = ?, slug = ?, description = ?, category_id = ?, 
           user_price = ?, reseller_price = ?, 
           features = ?, tips = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        slug,
        description,
        category_id,
        user_price,
        reseller_price,
        JSON.stringify(features || []),
        JSON.stringify(tips || []),
        status || "active",
        id,
      ],
    )

    // Update images jika ada
    if (images && Array.isArray(images)) {
      await db.execute("DELETE FROM product_images WHERE product_id = ?", [id])
      for (let i = 0; i < images.length; i++) {
        await db.execute("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)", [
          id,
          images[i],
          i,
        ])
      }
    }

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { params } = context
    const { id } = await params

    // Soft delete: set status jadi inactive
    await db.execute('UPDATE premium_products SET status = "inactive" WHERE id = ?', [id])

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
