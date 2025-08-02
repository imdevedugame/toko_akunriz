import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const [packageRows] = await db.execute(
      `
      SELECT 
        sp.*,
        ss.name as service_name,
        sc.name as category_name
      FROM service_packages sp
      JOIN social_services ss ON sp.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      WHERE sp.id = ?
    `,
      [params.id],
    )

    const packages = packageRows as any[]
    if (packages.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ package: packages[0] })
  } catch (error) {
    console.error("Failed to fetch service package:", error)
    return NextResponse.json({ error: "Failed to fetch service package" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
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

    await db.execute(
      `UPDATE service_packages 
       SET service_id = ?, name = ?, description = ?, quantity = ?, 
           price_user = ?, price_reseller = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [service_id, name, description || null, quantity, price_user, price_reseller, status || "active", params.id],
    )

    return NextResponse.json({ message: "Service package updated successfully" })
  } catch (error) {
    console.error("Failed to update service package:", error)
    return NextResponse.json({ error: "Failed to update service package" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    // Check if package has orders
    const [orderRows] = await db.execute("SELECT id FROM social_orders WHERE package_id = ?", [params.id])
    const orders = orderRows as any[]

    if (orders.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete package with existing orders",
        },
        { status: 400 },
      )
    }

    await db.execute("DELETE FROM service_packages WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Service package deleted successfully" })
  } catch (error) {
    console.error("Failed to delete service package:", error)
    return NextResponse.json({ error: "Failed to delete service package" }, { status: 500 })
  }
}
