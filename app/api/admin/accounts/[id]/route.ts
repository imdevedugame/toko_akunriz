import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accountId = params.id

    const [accountResult] = await db.query(
      `
      SELECT 
        pa.*,
        p.name as product_name,
        p.slug as product_slug
      FROM premium_accounts pa
      LEFT JOIN products p ON pa.product_id = p.id
      WHERE pa.id = ?
    `,
      [accountId]
    )

    const accounts = accountResult as any[]
    if (accounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      account: accounts[0],
    })
  } catch (error) {
    console.error("Get account error:", error)
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
    const accountId = params.id
    const body = await request.json()
    const { product_id, email, password } = body

    // Validate required fields
    if (!product_id || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      )
    }

    // Check if account exists
    const [existingAccount] = await db.query("SELECT id, status FROM premium_accounts WHERE id = ?", [accountId])
    if ((existingAccount as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      )
    }

    const account = (existingAccount as any[])[0]

    // Check if account is sold (cannot be edited)
    if (account.status === "sold") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot edit sold account",
        },
        { status: 400 }
      )
    }

    // Check if email already exists for other accounts
    const [emailCheck] = await db.query(
      "SELECT id FROM premium_accounts WHERE email = ? AND id != ?",
      [email, accountId]
    )
    if ((emailCheck as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Account with this email already exists",
        },
        { status: 400 }
      )
    }

    // Update account
    await db.query(
      `
      UPDATE premium_accounts SET
        product_id = ?, email = ?, password = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [product_id, email, password, accountId]
    )

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
    })
  } catch (error) {
    console.error("Update account error:", error)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accountId = params.id

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      // Check if account exists and get its details
      const [existingAccount] = await db.query(
        "SELECT id, status, duplicate_group_id, is_original FROM premium_accounts WHERE id = ?",
        [accountId]
      )
      
      if ((existingAccount as any[]).length === 0) {
        await db.query("ROLLBACK")
        return NextResponse.json(
          {
            success: false,
            error: "Account not found",
          },
          { status: 404 }
        )
      }

      const account = (existingAccount as any[])[0]

      // Check if account is reserved or sold
      if (account.status === "reserved") {
        await db.query("ROLLBACK")
        return NextResponse.json(
          {
            success: false,
            error: "Cannot delete reserved account",
          },
          { status: 400 }
        )
      }

      if (account.status === "sold") {
        await db.query("ROLLBACK")
        return NextResponse.json(
          {
            success: false,
            error: "Cannot delete sold account",
          },
          { status: 400 }
        )
      }

      // If this is an original account with duplicates, delete all duplicates too
      if (account.is_original && account.duplicate_group_id) {
        await db.query(
          "DELETE FROM premium_accounts WHERE duplicate_group_id = ?",
          [account.duplicate_group_id]
        )
      } else {
        // Just delete this single account
        await db.query("DELETE FROM premium_accounts WHERE id = ?", [accountId])
      }

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json({
        success: true,
        message: account.is_original ? "Account and all duplicates deleted successfully" : "Account deleted successfully",
      })
    } catch (transactionError) {
      await db.query("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Delete account error:", error)
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
