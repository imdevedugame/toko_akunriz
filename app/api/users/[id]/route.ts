import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hashPassword } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || (user.role !== "admin" && user.id.toString() !== params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute(
      "SELECT id, email, name, role, phone, balance, created_at, updated_at FROM users WHERE id = ?",
      [params.id],
    )

    const users = rows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || (user.role !== "admin" && user.id.toString() !== params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, password, name, phone, role, balance } = await request.json()

    let query = "UPDATE users SET "
    const params_array: any[] = []
    const updates: string[] = []

    if (email) {
      updates.push("email = ?")
      params_array.push(email)
    }

    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      params_array.push(hashedPassword)
    }

    if (name) {
      updates.push("name = ?")
      params_array.push(name)
    }

    if (phone !== undefined) {
      updates.push("phone = ?")
      params_array.push(phone)
    }

    if (role && user.role === "admin") {
      updates.push("role = ?")
      params_array.push(role)
    }

    if (balance !== undefined && user.role === "admin") {
      updates.push("balance = ?")
      params_array.push(balance)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updates.push("updated_at = CURRENT_TIMESTAMP")
    query += updates.join(", ") + " WHERE id = ?"
    params_array.push(params.id)

    await db.execute(query, params_array)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.execute("DELETE FROM users WHERE id = ?", [params.id])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
