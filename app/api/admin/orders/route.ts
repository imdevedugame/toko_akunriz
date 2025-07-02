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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const whereConditions = []
    const queryParams: any[] = []

    if (status && status !== "all") {
      whereConditions.push("o.status = ?")
      queryParams.push(status)
    }

    if (type && type !== "all") {
      whereConditions.push("o.type = ?")
      queryParams.push(type)
    }

    if (dateFrom) {
      whereConditions.push("o.created_at >= ?")
      queryParams.push(dateFrom)
    }

    if (dateTo) {
      whereConditions.push("o.created_at <= ?")
      queryParams.push(dateTo)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Final query with all filters
    const ordersQuery = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        CASE 
          WHEN o.type = 'premium_account' THEN (
            SELECT p.name FROM premium_products p 
            JOIN order_premium_items oi ON p.id = oi.product_id 
            WHERE oi.order_id = o.id LIMIT 1
          )
          ELSE NULL
        END as product_name,
        CASE 
          WHEN o.type = 'indosmm' THEN (
            SELECT s.name FROM indosmm_services s 
            JOIN order_indosmm_items oii ON s.id = oii.service_id 
            WHERE oii.order_id = o.id LIMIT 1
          )
          ELSE NULL
        END as service_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `

    const [orders] = await db.execute(ordersQuery, queryParams)

    // Attach item details for each order
    for (const order of orders as any[]) {
  if (order.type === "premium_account") {
    const [items] = await db.execute(
      `
      SELECT oi.*, p.name as product_name
      FROM order_premium_items oi
      JOIN premium_products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      `,
      [order.id]
    )
    order.items = items
  } else if (order.type === "indosmm") {
    const [items] = await db.execute(
      `
      SELECT oii.*, s.name as service_name, oii.price
      FROM order_indosmm_items oii
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE oii.order_id = ?
      `,
      [order.id]
    )
    order.items = items
  }
}

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
