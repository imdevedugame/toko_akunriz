import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    const offset = (page - 1) * limit

    // Build WHERE clause
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    if (search) {
      whereClause += " AND (name LIKE ? OR email LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (role !== "all") {
      whereClause += " AND role = ?"
      queryParams.push(role)
    }

    if (status !== "all") {
      whereClause += " AND status = ?"
      queryParams.push(status)
    }

    // Get total count
    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM users ${whereClause}`, queryParams)
    const total = (countResult as any[])[0].total

    // Get users with pagination
    const [rows] = await db.execute(
      `SELECT id, name, email, role, phone, balance, created_at, last_login, 
              COALESCE(status, 'active') as status
       FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      queryParams,
    )

    const users = rows as any[]
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      total,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role, phone, balance, status, password } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (!["user", "reseller", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if email already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, phone, balance, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, hashedPassword, role, phone || null, balance || 0, status],
    )

    const insertResult = result as any
    const newUserId = insertResult.insertId

    // Get the created user
    const [newUserRows] = await db.execute(
      `SELECT id, name, email, role, phone, balance, created_at, last_login,
              COALESCE(status, 'active') as status
       FROM users WHERE id = ?`,
      [newUserId],
    )

    const newUser = (newUserRows as any[])[0]

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
