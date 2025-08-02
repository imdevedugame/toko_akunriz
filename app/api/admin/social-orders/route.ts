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

    const page = Number.parseInt(searchParams.get("page") || "") || 1
    const limit = Number.parseInt(searchParams.get("limit") || "") || 20
    const offset = (page - 1) * limit

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const paymentStatus = searchParams.get("payment_status") || ""
    const serviceType = searchParams.get("service_type") || ""

    // Build WHERE clause
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += `
        AND (
          so.order_number LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
          OR so.whatsapp_number LIKE ?
          OR ss.name LIKE ?
        )
      `
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    }

    if (status) {
      whereClause += " AND so.status = ?"
      params.push(status)
    }

    if (paymentStatus) {
      whereClause += " AND so.payment_status = ?"
      params.push(paymentStatus)
    }

    if (serviceType) {
      whereClause += " AND ss.service_type = ?"
      params.push(serviceType)
    }

    // Main query
    const baseSql = `
      SELECT 
        so.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        ss.name as service_name,
        ss.service_type,
        sc.name as category_name,
        sp.name as package_name
      FROM social_orders so
      JOIN users u ON so.user_id = u.id
      JOIN social_services ss ON so.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      LEFT JOIN service_packages sp ON so.package_id = sp.id
      ${whereClause}
      ORDER BY so.created_at DESC
    `
    const finalSql = baseSql + ` LIMIT ${limit} OFFSET ${offset}`

    const [orderRows] = await db.execute(finalSql, params)

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM social_orders so
      JOIN users u ON so.user_id = u.id
      JOIN social_services ss ON so.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      LEFT JOIN service_packages sp ON so.package_id = sp.id
      ${whereClause}
    `
    const [countRows] = await db.execute(countSql, params)

    const orders = orderRows as any[]
    const totalCount = (countRows as any[])[0].total
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    })
  } catch (error) {
    console.error("Failed to fetch social orders:", error)
    return NextResponse.json({ error: "Failed to fetch social orders" }, { status: 500 })
  }
}
