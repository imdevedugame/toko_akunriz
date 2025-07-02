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
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = `
      SELECT * FROM indosmm_services 
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      query += " AND (name LIKE ? OR category LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category !== "all") {
      query += " AND category = ?"
      params.push(category)
    }

    if (status !== "all") {
      query += " AND status = ?"
      params.push(status)
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total")
    const countParams = [...params];
    const [countRows] = await db.execute(countQuery, countParams);
    const total = (countRows as any[])[0]?.total || 0;

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(query, params);

    return NextResponse.json({
      services: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get admin services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      service_id,
      name,
      category,
      rate,
      min_order,
      max_order,
      user_rate,
      reseller_rate,
      image_url,
      description,
      status = "active",
    } = body

    // Validation
    if (!service_id || !name || !category || rate === undefined || rate === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const baseRate = Number(rate)
    if (isNaN(baseRate) || baseRate < 0) {
      return NextResponse.json({ error: "Invalid rate value" }, { status: 400 })
    }

    const minOrder = Number(min_order) || 1
    const maxOrder = Number(max_order) || 10000

    // Auto-calculate rates if not provided
    const calculatedUserRate = user_rate !== undefined && user_rate !== null ? Number(user_rate) : baseRate * 1.2
    const calculatedResellerRate = reseller_rate !== undefined && reseller_rate !== null ? Number(reseller_rate) : baseRate * 1.1

    if (
      isNaN(calculatedUserRate) || calculatedUserRate < 0 ||
      isNaN(calculatedResellerRate) || calculatedResellerRate < 0
    ) {
      return NextResponse.json({ error: "Invalid user_rate or reseller_rate value" }, { status: 400 })
    }

    // Check for duplicate service_id
    const [existingRows] = await db.execute("SELECT id FROM indosmm_services WHERE service_id = ?", [service_id])

    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Service ID already exists" }, { status: 400 })
    }

    // Cek batas rate (misal DECIMAL(10,2))
    if (
      baseRate > 99999999.99 ||
      calculatedUserRate > 99999999.99 ||
      calculatedResellerRate > 99999999.99
    ) {
      return NextResponse.json({ error: "Rate value is too large" }, { status: 400 })
    }

    let result
    try {
      [result] = await db.execute(
        `INSERT INTO indosmm_services 
         (service_id, name, category, rate, min_order, max_order, user_rate, reseller_rate, image_url, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          service_id,
          name,
          category,
          baseRate,
          minOrder,
          maxOrder,
          calculatedUserRate,
          calculatedResellerRate,
          image_url || "/images/services/website.png",
          description || "",
          status,
        ],
      )
    } catch (err: any) {
      if (err.code === "ER_WARN_DATA_OUT_OF_RANGE") {
        return NextResponse.json({ error: "Rate value is out of range for the database column" }, { status: 400 })
      }
      throw err
    }

    const insertId = (result as any).insertId

    // Get the created service
    const [createdRows] = await db.execute("SELECT * FROM indosmm_services WHERE id = ?", [insertId])

    return NextResponse.json({
      message: "Service created successfully",
      service: (createdRows as any[])[0],
    })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
