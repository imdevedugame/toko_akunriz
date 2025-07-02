import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Check if token exists and is valid
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

    return NextResponse.json({
      valid: true,
      user: {
        email: tokens[0].email,
        name: tokens[0].name,
      },
    })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
