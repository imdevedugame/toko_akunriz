import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, generateToken } from "@/lib/auth"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, role = "user" } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert user
    const [result] = await db.execute("INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)", [
      email,
      hashedPassword,
      name,
      phone,
      role,
    ])

    const userId = (result as any).insertId

    // Generate token
    const token = generateToken({
      id: userId,
      email,
      name,
      role,
      phone,
      balance: 0,
    })

    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: userId,
        email,
        name,
        role,
        phone,
        balance: 0,
      },
      token,
    })

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
