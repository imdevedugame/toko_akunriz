import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hashPassword } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const [rows] = await db.execute(
      `SELECT id, name, email, role, phone, balance, created_at, last_login,
              COALESCE(status, 'active') as status
       FROM users WHERE id = ?`,
      [userId],
    )

    const users = rows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, role, phone, balance, status, password } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    if (!["user", "reseller", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE id = ?", [userId])

    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is taken by another user
    const [emailCheck] = await db.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])

    if ((emailCheck as any[]).length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Prepare update query
    let updateQuery = `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, balance = ?, status = ?`
    const queryParams = [name, email, role, phone || null, balance || 0, status]

    // Add password to update if provided
    if (password) {
      const hashedPassword = await hashPassword(password)
      updateQuery += `, password = ?`
      queryParams.push(hashedPassword)
    }

    updateQuery += ` WHERE id = ?`
    queryParams.push(userId)

    // Update user
    await db.execute(updateQuery, queryParams)

    // Get updated user
    const [updatedUserRows] = await db.execute(
      `SELECT id, name, email, role, phone, balance, created_at, last_login,
              COALESCE(status, 'active') as status
       FROM users WHERE id = ?`,
      [userId],
    )

    const updatedUser = (updatedUserRows as any[])[0]

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Check if user exists
    const [existingUsers] = await db.execute("SELECT id, name FROM users WHERE id = ?", [userId])

    if ((existingUsers as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userToDelete = (existingUsers as any[])[0]

    // Start transaction to delete user and related data
    await db.execute("START TRANSACTION")

    try {
      // Delete related data first (foreign key constraints)
      await db.execute("DELETE FROM orders WHERE user_id = ?", [userId])
      await db.execute("DELETE FROM indosmm_orders WHERE user_id = ?", [userId])
      await db.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", [userId])

      // Delete the user
      await db.execute("DELETE FROM users WHERE id = ?", [userId])

      await db.execute("COMMIT")

      return NextResponse.json({
        message: `User ${userToDelete.name} deleted successfully`,
      })
    } catch (error) {
      await db.execute("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
