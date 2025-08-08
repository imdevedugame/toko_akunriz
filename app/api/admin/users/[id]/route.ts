import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const [userResult] = await db.query(
      `
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users 
      WHERE id = ?
    `,
      [userId]
    )

    const users = userResult as any[]
    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const body = await request.json()
    const { name, email, role, status, password } = body

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const [existingUser] = await db.query("SELECT id FROM users WHERE id = ?", [userId])
    if ((existingUser as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Check if email already exists for other users
    const [emailCheck] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])
    if ((emailCheck as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      )
    }

    // Prepare update query
    let updateQuery = `
      UPDATE users SET
        name = ?, email = ?, role = ?, status = ?, updated_at = NOW()
    `
    let queryParams = [name, email, role, status || 'active']

    // If password is provided, hash it and include in update
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 6 characters",
          },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      updateQuery += ", password = ?"
      queryParams.push(hashedPassword)
    }

    updateQuery += " WHERE id = ?"
    queryParams.push(userId)

    // Update user
    await db.query(updateQuery, queryParams)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Ambil ID dari URL
    const url = new URL(request.url)
    const userId = url.pathname.split("/").pop()

    if (!userId) {
      console.log("[DEBUG] User ID not found in URL")
      return NextResponse.json({ success: false, error: "User ID not provided" }, { status: 400 })
    }

    console.log("[DEBUG] Deleting user with ID:", userId)

    // Mulai transaksi
    await db.query("START TRANSACTION")

    try {
      // Cek apakah user ada
      const [existingUser] = await db.query("SELECT id, role FROM users WHERE id = ?", [userId])

      if ((existingUser as any[]).length === 0) {
        console.log("[DEBUG] User not found in database")
        await db.query("ROLLBACK")
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      const user = (existingUser as any[])[0]
      console.log("[DEBUG] User data:", user)

      if (user.role === "admin") {
        console.log("[DEBUG] Attempted to delete admin user")
        await db.query("ROLLBACK")
        return NextResponse.json({ success: false, error: "Cannot delete admin user" }, { status: 400 })
      }

      // Cek apakah user punya pesanan yang masih aktif
      const [pendingOrders] = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status IN ('pending', 'processing')",
        [userId]
      )

      const pendingCount = (pendingOrders as any[])[0]?.count ?? 0
      console.log("[DEBUG] Pending orders count:", pendingCount)

      if (pendingCount > 0) {
        console.log("[DEBUG] User has pending or processing orders")
        await db.query("ROLLBACK")
        return NextResponse.json({ success: false, error: "Cannot delete user with pending orders" }, { status: 400 })
      }

      // Batalkan pesanan yang masih pending
      await db.query(
        `UPDATE orders SET 
          status = 'cancelled', 
          cancellation_reason = 'User account deleted',
          auto_cancelled_at = NOW(),
          updated_at = NOW()
        WHERE user_id = ? AND status = 'pending'`,
        [userId]
      )

      // Ubah status premium account terkait
      await db.query(
        `UPDATE premium_accounts SET 
          status = 'available', 
          reserved_for_order_id = NULL,
          updated_at = NOW()
        WHERE reserved_for_order_id IN (
          SELECT id FROM orders WHERE user_id = ?
        )`,
        [userId]
      )

      // Hapus token reset password
      await db.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [userId])

      // Hapus user
      await db.query("DELETE FROM users WHERE id = ?", [userId])

      // Commit
      await db.query("COMMIT")

      console.log("[DEBUG] User deleted successfully")
      return NextResponse.json({ success: true, message: "User deleted successfully" })
    } catch (transactionError) {
      await db.query("ROLLBACK")
      console.error("[DEBUG] Error during transaction:", transactionError)
      throw transactionError
    }
  } catch (error) {
    console.error("[DEBUG] Internal server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}