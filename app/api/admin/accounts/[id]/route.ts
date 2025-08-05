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
    const [currentRows] = await db.query("SELECT product_id, duplicate_group_id FROM premium_accounts WHERE id = ?", [
      params.id,
    ])

    if ((currentRows as any[]).length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const currentAccount = (currentRows as any[])[0]

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      // Update account info
      await db.query("UPDATE premium_accounts SET product_id = ?, email = ?, password = ? WHERE id = ?", [
        product_id,
        email,
        password,
        params.id,
      ])

      // If this account has duplicates, update all duplicates with the same email/password
      if (currentAccount.duplicate_group_id) {
        await db.query(
          "UPDATE premium_accounts SET email = ?, password = ? WHERE duplicate_group_id = ? AND id != ?",
          [email, password, currentAccount.duplicate_group_id, params.id],
        )
      }

      await db.query("COMMIT")

      return NextResponse.json({ message: "Account updated successfully" }, { status: 200 })
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get account info
    const [accountRows] = await db.query(
      `SELECT product_id, duplicate_group_id, original_account_id, duplicate_count 
       FROM premium_accounts WHERE id = ?`,
      [params.id],
    )

    if ((accountRows as any[]).length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const account = (accountRows as any[])[0]

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      let deletedCount = 1

      // If this is an original account with duplicates, delete all duplicates
      if (account.duplicate_group_id && !account.original_account_id) {
        const [duplicateRows] = await db.query(
          "SELECT COUNT(*) as count FROM premium_accounts WHERE duplicate_group_id = ?",
          [account.duplicate_group_id],
        )
        deletedCount = (duplicateRows as any[])[0].count

        // Delete all accounts in the duplicate group
        await db.query("DELETE FROM premium_accounts WHERE duplicate_group_id = ?", [account.duplicate_group_id])
      } else {
        // Delete single account
        await db.query("DELETE FROM premium_accounts WHERE id = ?", [params.id])
      }

      // Update product stock
      await db.query("UPDATE premium_products SET stock = stock - ? WHERE id = ?", [deletedCount, account.product_id])

      await db.query("COMMIT")

      return NextResponse.json({
        message: `Account${deletedCount > 1 ? "s" : ""} deleted successfully`,
        deletedCount,
      })
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
