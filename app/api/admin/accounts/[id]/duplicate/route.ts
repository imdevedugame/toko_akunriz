import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { count } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid duplicate count" }, { status: 400 })
    }

    // Get original account
    const [accountRows] = await db.query("SELECT * FROM premium_accounts WHERE id = ? AND status = 'available'", [
      params.id,
    ])

    if ((accountRows as any[]).length === 0) {
      return NextResponse.json({ error: "Account not found or not available" }, { status: 404 })
    }

    const originalAccount = (accountRows as any[])[0]

    // Check if account already has duplicates
    if (originalAccount.original_account_id) {
      return NextResponse.json({ error: "Cannot create duplicates of a duplicate account" }, { status: 400 })
    }

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      let duplicateGroupId = originalAccount.duplicate_group_id

      // If no duplicate group exists, create one and update original account
      if (!duplicateGroupId) {
        duplicateGroupId = uuidv4()
        await db.query(
          "UPDATE premium_accounts SET duplicate_group_id = ?, duplicate_count = ?, duplicate_index = 0 WHERE id = ?",
          [duplicateGroupId, count + 1, params.id],
        )
      }

      // Get current highest duplicate index
      const [maxIndexRows] = await db.query(
        "SELECT MAX(duplicate_index) as max_index FROM premium_accounts WHERE duplicate_group_id = ?",
        [duplicateGroupId],
      )
      const maxIndex = (maxIndexRows as any[])[0].max_index || 0

      // Create duplicates
      for (let i = 1; i <= count; i++) {
        await db.query(
          `INSERT INTO premium_accounts 
           (product_id, email, password, duplicate_group_id, duplicate_count, original_account_id, duplicate_index) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            originalAccount.product_id,
            originalAccount.email,
            originalAccount.password,
            duplicateGroupId,
            count + 1,
            params.id,
            maxIndex + i,
          ],
        )
      }

      // Update product stock
      await db.query("UPDATE premium_products SET stock = stock + ? WHERE id = ?", [
        count,
        originalAccount.product_id,
      ])

      // Update duplicate count for all accounts in the group
      await db.query(
        "UPDATE premium_accounts SET duplicate_count = duplicate_count + ? WHERE duplicate_group_id = ?",
        [count, duplicateGroupId],
      )

      await db.query("COMMIT")

      return NextResponse.json({
        message: `${count} duplicate${count > 1 ? "s" : ""} created successfully`,
        duplicatesCreated: count,
      })
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Create duplicates error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
