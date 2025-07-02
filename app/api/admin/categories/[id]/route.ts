import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists (excluding current category)
    const [existingRows] = await db.execute("SELECT id FROM categories WHERE slug = ? AND id != ?", [slug, params.id])
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }

    await db.execute("UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?", [
      name,
      slug,
      description || null,
      params.id,
    ])

    return NextResponse.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if category is being used by products
    const [productRows] = await db.execute("SELECT COUNT(*) as count FROM premium_products WHERE category_id = ?", [
      params.id,
    ])
    const productCount = (productRows as any[])[0].count

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It is being used by ${productCount} product(s).`,
        },
        { status: 400 },
      )
    }

    await db.execute("DELETE FROM categories WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
