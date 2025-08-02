import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute(`
      SELECT 
        ss.*,
        sc.name as category_name,
        sc.slug as category_slug
      FROM social_services ss
      JOIN social_categories sc ON ss.category_id = sc.id
      ORDER BY ss.created_at DESC
    `)

    const services = (rows as any[]).map((service) => ({
      ...service,
      price_user: Number(service.price_user),
      price_reseller: Number(service.price_reseller),
      min_order: Number(service.min_order),
      max_order: Number(service.max_order),
      features:
        typeof service.features === "string"
          ? JSON.parse(service.features)
          : Array.isArray(service.features)
          ? service.features
          : [],
    }))

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Failed to fetch social services:", error)
    return NextResponse.json({ error: "Failed to fetch social services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      category_id,
      name,
      description,
      service_type,
      price_user,
      price_reseller,
      min_order,
      max_order,
      features,
      service_mode,
      status,
    } = await request.json()

    // Validasi field yang wajib diisi
    if (!category_id || !name || !service_type || price_user == null || price_reseller == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validasi jenis layanan
    const validTypes = ["followers", "likes", "comments", "views", "subscribers", "shares"]
    if (!validTypes.includes(service_type)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 })
    }

    // Validasi kategori
    const [categoryRows] = await db.execute("SELECT id FROM social_categories WHERE id = ?", [category_id])
    const categories = categoryRows as any[]

    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 })
    }

    const [result] = await db.execute(
      `INSERT INTO social_services 
       (category_id, name, description, service_type, price_user, price_reseller, 
        min_order, max_order, features, service_mode, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        category_id,
        name,
        description || null,
        service_type,
        price_user,
        price_reseller,
        min_order || 100,
        max_order || 100000,
        JSON.stringify(features || []),
        service_mode || "custom",
        status || "active",
      ],
    )

    const insertResult = result as any
    return NextResponse.json({
      message: "Social service created successfully",
      id: insertResult.insertId,
    })
  } catch (error) {
    console.error("Failed to create social service:", error)
    return NextResponse.json({ error: "Failed to create social service" }, { status: 500 })
  }
}
