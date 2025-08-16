import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    const [categories] = await db.execute(`
      SELECT 
        id,
        name,
        slug,
        description,
        image_url,
        status
      FROM social_categories
      WHERE status = 'active'
      ORDER BY name ASC
    `)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Failed to fetch social categories:", error)
    return NextResponse.json({ error: "Failed to fetch social categories" }, { status: 500 })
  }
}
