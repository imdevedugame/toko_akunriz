import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id, email, password } = await request.json()

    if (!product_id || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Get current account info
    const [currentRows] = await db.execute("SELECT product_id FROM premium_accounts WHERE id = ?", [params.id])

    // Check if account exists
    if (currentRows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Update account info
    await db.execute("UPDATE premium_accounts SET product_id = ?, email = ?, password = ? WHERE id = ?", [
      product_id,
      email,
      password,
      params.id,
    ])

    return NextResponse.json({ message: "Account updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
