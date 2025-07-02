import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hashPassword } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT id, email, name, role, phone, balance, created_at, updated_at
      FROM users
      WHERE 1=1
    `

    const params: any[] = []

    if (role) {
      query += " AND role = ?"
      params.push(role)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await db.execute(query, params)

    return NextResponse.json({ users: rows })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, password, name, phone, role, balance = 0 } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert user
    const [result] = await db.execute(
      "INSERT INTO users (email, password, name, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, name, phone, role, balance],
    )

    return NextResponse.json({
      message: "User created successfully",
      userId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
