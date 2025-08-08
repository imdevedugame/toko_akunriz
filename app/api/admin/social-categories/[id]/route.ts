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
    const [categoryRows] = await db.execute("SELECT * FROM social_categories WHERE id = ?", [params.id])
    const categories = categoryRows as any[]

    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: categories[0] })
  } catch (error) {
    console.error("Failed to fetch social category:", error)
    return NextResponse.json({ error: "Failed to fetch social category" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const { name, slug, description, image_url, status } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists (excluding current category)
    const [existingCategory] = await db.execute("SELECT id FROM social_categories WHERE slug = ? AND id != ?", [
      slug,
      params.id,
    ])
    const existing = existingCategory as any[]

    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    await db.execute(
      `UPDATE social_categories 
       SET name = ?, slug = ?, description = ?, image_url = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, slug, description || null, image_url || null, status || "active", params.id],
    )

    return NextResponse.json({ message: "Social category updated successfully" })
  } catch (error) {
    console.error("Failed to update social category:", error)
    return NextResponse.json({ error: "Failed to update social category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    // Check if category has services
    const [serviceRows] = await db.execute("SELECT id FROM social_services WHERE category_id = ?", [params.id])
    const services = serviceRows as any[]

    if (services.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with existing services",
        },
        { status: 400 },
      )
    }

    await db.execute("DELETE FROM social_categories WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Social category deleted successfully" })
  } catch (error) {
    console.error("Failed to delete social category:", error)
    return NextResponse.json({ error: "Failed to delete social category" }, { status: 500 })
  }
}
