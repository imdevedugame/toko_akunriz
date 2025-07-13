import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const productId = searchParams.get("product_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT pa.*, pp.name as product_name
      FROM premium_accounts pa
      JOIN premium_products pp ON pa.product_id = pp.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status && status !== "all") {
      query += " AND pa.status = ?"
      params.push(status)
    }

    if (productId && productId !== "all") {
      query += " AND pa.product_id = ?"
      params.push(productId)
    }

    query += ` ORDER BY pa.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const [rows] = await db.execute(query, params)

    return NextResponse.json({ accounts: rows })
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

   const { product_id, email, password, description } = await request.json()

if (!product_id || !email || !password) {
  return NextResponse.json({ error: "All fields are required" }, { status: 400 })
}


    // Check if account already exists
    const [existingRows] = await db.execute("SELECT id FROM premium_accounts WHERE email = ? AND product_id = ?", [
      email,
      product_id,
    ])

    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Account already exists for this product" }, { status: 409 })
    }
if (description && description.length > 1000) {
  return NextResponse.json({ error: "Description too long" }, { status: 400 })
}

   const [result] = await db.execute(
  "INSERT INTO premium_accounts (product_id, email, password, description) VALUES (?, ?, ?, ?)",
  [product_id, email, password, description || null]
)

    // Update product stock
    await db.execute("UPDATE premium_products SET stock = stock + 1 WHERE id = ?", [product_id])

    return NextResponse.json({
      message: "Account created successfully",
      accountId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create account error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
