import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [packages] = await db.execute(`
      SELECT 
        sp.*,
        ss.name as service_name,
        sc.name as category_name
      FROM service_packages sp
      JOIN social_services ss ON sp.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      ORDER BY sp.created_at DESC
    `)

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Failed to fetch service packages:", error)
    return NextResponse.json({ error: "Failed to fetch service packages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { service_id, name, description, quantity, price_user, price_reseller, status } = await request.json()

    if (!service_id || !name || !quantity || !price_user || !price_reseller) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate service exists
    const [serviceRows] = await db.execute("SELECT id FROM social_services WHERE id = ?", [service_id])
    const services = serviceRows as any[]

    if (services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 400 })
    }

    const [result] = await db.execute(
      `INSERT INTO service_packages 
       (service_id, name, description, quantity, price_user, price_reseller, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [service_id, name, description || null, quantity, price_user, price_reseller, status || "active"],
    )

    const insertResult = result as any
    return NextResponse.json({
      message: "Service package created successfully",
      id: insertResult.insertId,
    })
  } catch (error) {
    console.error("Failed to create service package:", error)
    return NextResponse.json({ error: "Failed to create service package" }, { status: 500 })
  }
}
