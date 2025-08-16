import { type NextRequest, NextResponse } from "next/server"
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const now = new Date()

    // Get active flash sale products
    const [rows] = await db.execute(
      `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.user_price,
        p.reseller_price,
        p.fake_price,
        p.flash_sale_start,
        p.flash_sale_end,
        p.flash_sale_discount_percent,
        (
          SELECT COUNT(*) 
          FROM premium_accounts pa 
          WHERE pa.product_id = p.id AND pa.status = 'available'
        ) AS available_stock,
        c.name AS category_name,
        c.slug AS category_slug,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS images
      FROM premium_products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.status = 'active' 
        AND p.is_flash_sale = TRUE
        AND p.flash_sale_start <= ?
        AND p.flash_sale_end >= ?
      GROUP BY p.id
      ORDER BY p.flash_sale_end ASC
      LIMIT ?
    `,
      [now, now, limit],
    )

    const products = (rows as any[]).map((product) => {
      const flashSalePrice = Math.round(product.user_price * (1 - (product.flash_sale_discount_percent || 0) / 100))

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        user_price: Number.parseFloat(product.user_price),
        reseller_price: Number.parseFloat(product.reseller_price),
        fake_price: product.fake_price ? Number.parseFloat(product.fake_price) : null,
        available_stock: Number.parseInt(product.available_stock) || 0,
        category_name: product.category_name,
        category_slug: product.category_slug,
        images: product.images ? product.images.split(",") : [],
        is_flash_sale: true,
        is_flash_sale_active: true,
        flash_sale_price: flashSalePrice,
        flash_sale_discount_percent: product.flash_sale_discount_percent || 0,
        flash_sale_start: product.flash_sale_start,
        flash_sale_end: product.flash_sale_end,
        savings: product.user_price - flashSalePrice,
      }
    })

    return NextResponse.json({
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Get active flash sales error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
