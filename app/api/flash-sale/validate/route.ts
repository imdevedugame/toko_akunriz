import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const [rows] = await db.execute(
      `
      SELECT 
        p.id,
        p.name,
        p.user_price,
        p.reseller_price,
        p.is_flash_sale,
        p.flash_sale_start,
        p.flash_sale_end,
        p.flash_sale_discount_percent,
        (
          SELECT COUNT(*) 
          FROM premium_accounts pa 
          WHERE pa.product_id = p.id AND pa.status = 'available'
        ) AS available_stock
      FROM premium_products p
      WHERE p.id = ? AND p.status = 'active'
    `,
      [product_id],
    )

    const product = (rows as any[])[0]
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const now = new Date()
    const isFlashSaleActive =
      product.is_flash_sale &&
      product.flash_sale_start &&
      product.flash_sale_end &&
      new Date(product.flash_sale_start) <= now &&
      new Date(product.flash_sale_end) >= now

    // If flash sale has ended, update the product
    if (product.is_flash_sale && product.flash_sale_end && new Date(product.flash_sale_end) < now) {
      await db.execute(
        `
        UPDATE premium_products 
        SET is_flash_sale = FALSE, flash_sale_start = NULL, flash_sale_end = NULL 
        WHERE id = ?
      `,
        [product_id],
      )
    }

    const flashSalePrice = isFlashSaleActive
      ? Math.round(product.user_price * (1 - (product.flash_sale_discount_percent || 0) / 100))
      : null

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        user_price: Number.parseFloat(product.user_price),
        reseller_price: Number.parseFloat(product.reseller_price),
        available_stock: Number.parseInt(product.available_stock) || 0,
        is_flash_sale: Boolean(product.is_flash_sale),
        is_flash_sale_active: isFlashSaleActive,
        flash_sale_price: flashSalePrice,
        flash_sale_discount_percent: product.flash_sale_discount_percent || 0,
        flash_sale_start: product.flash_sale_start,
        flash_sale_end: product.flash_sale_end,
      },
    })
  } catch (error) {
    console.error("Flash sale validate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
