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
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = (page - 1) * limit

    const [orders] = await db.execute(
      `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.total_amount,
        o.created_at,
        o.updated_at,
        u.email AS user_email,
        p.name AS product_name,
        c.name AS category_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_premium_items opi ON opi.order_id = o.id
      JOIN premium_products p ON opi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.type = 'premium_account'
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    )

    const [countRows] = await db.execute(`
      SELECT COUNT(*) as total
      FROM orders o
      JOIN order_premium_items opi ON opi.order_id = o.id
      JOIN premium_products p ON opi.product_id = p.id
      WHERE o.type = 'premium_account'
    `)

    const total = (countRows as any[])[0].total

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch premium orders:", error)
    return NextResponse.json({ error: "Failed to fetch premium orders" }, { status: 500 })
  }
}
