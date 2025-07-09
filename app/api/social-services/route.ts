import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search") || ""
    const serviceType = searchParams.get("service_type")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limitRaw = parseInt(searchParams.get("limit") || "20", 10)

    const safeLimit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 20
    const safeOffset = (page - 1) * safeLimit

    // Base Query & Parameters
    let baseQuery = `
      FROM social_services ss
      JOIN social_categories sc ON ss.category_id = sc.id
      WHERE ss.status = 'active' AND sc.status = 'active'
    `
    const baseParams: any[] = []

    if (category && category !== "all") {
      baseQuery += " AND ss.category_id = ?"
      baseParams.push(category)
    }

    if (serviceType && serviceType !== "all") {
      baseQuery += " AND ss.service_type = ?"
      baseParams.push(serviceType)
    }

    if (search) {
      baseQuery += " AND (ss.name LIKE ? OR ss.description LIKE ? OR sc.name LIKE ?)"
      const like = `%${search}%`
      baseParams.push(like, like, like)
    }

    // Query total count
    const countSql = `SELECT COUNT(*) as total ${baseQuery}`
    const [countResult] = await db.execute(countSql, baseParams)
    const total = (countResult as any[])[0]?.total || 0

    // Query data with pagination (LIMIT & OFFSET via interpolation)
    const dataSql = `
      SELECT ss.*, sc.name AS category_name, sc.image_url AS category_image
      ${baseQuery}
      ORDER BY sc.name ASC, ss.name ASC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `
    const [rows] = await db.execute(dataSql, baseParams)

    // Parse features JSON field safely
    const services = (rows as any[]).map((service) => ({
      ...service,
      features:
        typeof service.features === "string"
          ? JSON.parse(service.features)
          : Array.isArray(service.features)
          ? service.features
          : [],
    }))

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
        hasNext: safeOffset + safeLimit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get social services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
