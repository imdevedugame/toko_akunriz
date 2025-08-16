import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const [packages] = await db.execute(
      `
      SELECT 
        id,
        name,
        description,
        quantity,
        price_user,
        price_reseller,
        status
      FROM service_packages
      WHERE service_id = ? AND status = 'active'
      ORDER BY quantity ASC
    `,
      [params.id],
    )

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Failed to fetch service packages:", error)
    return NextResponse.json({ error: "Failed to fetch service packages" }, { status: 500 })
  }
}
