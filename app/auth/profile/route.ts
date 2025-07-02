import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email is already taken by another user
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, user.id])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "Email already taken" }, { status: 409 })
    }

    // Update user profile
    await db.execute("UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?", [name, email, phone, user.id])

    return NextResponse.json({
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
