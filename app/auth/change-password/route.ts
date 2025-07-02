import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth"
import db from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
    }

    // Get current password hash from database
    const [users] = await db.execute("SELECT password FROM users WHERE id = ?", [user.id])
    const userData = (users as any[])[0]

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password in database
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, user.id])

    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
