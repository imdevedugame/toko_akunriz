import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { getPasswordResetSuccessTemplate } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  let connection

  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const [tokenRows] = await db.execute(
      `SELECT prt.*, u.email, u.name 
       FROM password_reset_tokens prt 
       JOIN users u ON prt.user_id = u.id 
       WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE`,
      [token],
    )

    const tokens = tokenRows as any[]
    if (tokens.length === 0) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa" }, { status: 400 })
    }

    const tokenData = tokens[0]
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🔄 Gunakan connection manual
    connection = await db.getConnection()
    await connection.beginTransaction()

    await connection.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, tokenData.user_id]
    )

    await connection.execute(
      "UPDATE password_reset_tokens SET used = TRUE WHERE id = ?",
      [tokenData.id]
    )

    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ? AND id != ?",
      [tokenData.user_id, tokenData.id]
    )

    await connection.commit()

    const { html, text } = getPasswordResetSuccessTemplate(tokenData.name)
    await sendEmail({
      to: tokenData.email,
      subject: "Password Berhasil Direset - Vyloz Premium Zone",
      html,
      text,
    })

    return NextResponse.json({ message: "Password has been reset successfully" })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    if (connection) await connection.release()
  }
}
