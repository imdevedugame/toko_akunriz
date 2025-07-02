import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute("SELECT * FROM categories ORDER BY name ASC")

    return NextResponse.json({ categories: rows })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const [existingRows] = await db.execute("SELECT id FROM categories WHERE slug = ?", [slug])
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }

    const [result] = await db.execute("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)", [
      name,
      slug,
      description || null,
    ])

    return NextResponse.json({
      message: "Category created successfully",
      categoryId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
