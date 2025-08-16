import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import db from "@/lib/db"
import { sendEmail} from "@/lib/email"
import { getPasswordResetEmailTemplate } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const [userRows] = await db.execute("SELECT id, name, email FROM users WHERE email = ?", [email])

    const users = userRows as any[]
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with that email exists, we have sent a password reset link.",
      })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing reset tokens for this user
    await db.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.id])

    // Insert new reset token
    await db.execute("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [
      user.id,
      resetToken,
      expiresAt,
    ])

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`

    // Get email template
    const { html, text } = getPasswordResetEmailTemplate(resetUrl, user.name)

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset Password - Vyloz Premium Zone",
      html,
      text,
    })

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error)
      return NextResponse.json({ error: "Failed to send reset email. Please try again later." }, { status: 500 })
    }

    return NextResponse.json({
      message: "If an account with that email exists, we have sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
