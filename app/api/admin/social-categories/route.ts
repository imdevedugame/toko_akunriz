import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [categories] = await db.execute(`
      SELECT 
        id,
        name,
        slug,
        description,
        image_url,
        status,
        created_at,
        updated_at
      FROM social_categories
      ORDER BY name ASC
    `)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Failed to fetch social categories:", error)
    return NextResponse.json({ error: "Failed to fetch social categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, image_url, status } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const [existingCategory] = await db.execute("SELECT id FROM social_categories WHERE slug = ?", [slug])
    const existing = existingCategory as any[]

    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    const [result] = await db.execute(
      `INSERT INTO social_categories (name, slug, description, image_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, slug, description || null, image_url || null, status || "active"],
    )

    const insertResult = result as any
    return NextResponse.json({
      message: "Social category created successfully",
      id: insertResult.insertId,
    })
  } catch (error) {
    console.error("Failed to create social category:", error)
    return NextResponse.json({ error: "Failed to create social category" }, { status: 500 })
  }
}
