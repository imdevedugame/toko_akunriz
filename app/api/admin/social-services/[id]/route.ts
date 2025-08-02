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
    const [serviceRows] = await db.execute(
      `
      SELECT 
        ss.*,
        sc.name as category_name,
        sc.slug as category_slug
      FROM social_services ss
      JOIN social_categories sc ON ss.category_id = sc.id
      WHERE ss.id = ?
    `,
      [params.id],
    )

    const services = serviceRows as any[]
    if (services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Parse features JSON
    const serviceWithFeatures = {
      ...services[0],
      features: services[0].features ? JSON.parse(services[0].features) : [],
    }

    return NextResponse.json({ service: serviceWithFeatures })
  } catch (error) {
    console.error("Failed to fetch social service:", error)
    return NextResponse.json({ error: "Failed to fetch social service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
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

    if (!category_id || !name || !service_type || !price_user || !price_reseller) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate service type
    const validTypes = ["followers", "likes", "comments", "views", "subscribers", "shares"]
    if (!validTypes.includes(service_type)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 })
    }

    // Validate category exists
    const [categoryRows] = await db.execute("SELECT id FROM social_categories WHERE id = ?", [category_id])
    const categories = categoryRows as any[]

    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 })
    }

    await db.execute(
      `UPDATE social_services 
       SET category_id = ?, name = ?, description = ?, service_type = ?, 
           price_user = ?, price_reseller = ?, min_order = ?, max_order = ?, 
           features = ?, service_mode = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
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
        params.id,
      ],
    )

    return NextResponse.json({ message: "Social service updated successfully" })
  } catch (error) {
    console.error("Failed to update social service:", error)
    return NextResponse.json({ error: "Failed to update social service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    // Check if service has orders
    const [orderRows] = await db.execute("SELECT id FROM social_orders WHERE service_id = ?", [params.id])
    const orders = orderRows as any[]

    if (orders.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete service with existing orders",
        },
        { status: 400 },
      )
    }

    // Check if service has packages
    const [packageRows] = await db.execute("SELECT id FROM service_packages WHERE service_id = ?", [params.id])
    const packages = packageRows as any[]

    if (packages.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete service with existing packages",
        },
        { status: 400 },
      )
    }

    await db.execute("DELETE FROM social_services WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Social service deleted successfully" })
  } catch (error) {
    console.error("Failed to delete social service:", error)
    return NextResponse.json({ error: "Failed to delete social service" }, { status: 500 })
  }
}
