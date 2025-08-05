import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const productId = searchParams.get("product_id")
    const duplicateFilter = searchParams.get("duplicate_filter")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT pa.*, pp.name as product_name
      FROM premium_accounts pa
      JOIN premium_products pp ON pa.product_id = pp.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status && status !== "all") {
      query += " AND pa.status = ?"
      params.push(status)
    }

    if (productId && productId !== "all") {
      query += " AND pa.product_id = ?"
      params.push(productId)
    }

    // Handle duplicate filtering
    if (duplicateFilter && duplicateFilter !== "all") {
      switch (duplicateFilter) {
        case "original":
          query += " AND pa.original_account_id IS NULL AND pa.duplicate_group_id IS NOT NULL"
          break
        case "duplicate":
          query += " AND pa.original_account_id IS NOT NULL"
          break
        case "has-duplicates":
          query += " AND pa.duplicate_group_id IS NOT NULL"
          break
      }
    }

    query += " ORDER BY pa.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await db.query(query, params)

    return NextResponse.json({ accounts: rows })
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id, email, password, create_duplicates, duplicate_count } = await request.json()

    if (!product_id || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if account already exists
    const [existingRows] = await db.query("SELECT id FROM premium_accounts WHERE email = ? AND product_id = ?", [
      email,
      product_id,
    ])

    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Account already exists for this product" }, { status: 409 })
    }

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      let duplicateGroupId = null
      let totalAccounts = 1

      if (create_duplicates && duplicate_count > 1) {
        duplicateGroupId = uuidv4()
        totalAccounts = duplicate_count
      }

      // Create original account
      const [result] = await db.query(
        `INSERT INTO premium_accounts 
         (product_id, email, password, duplicate_group_id, duplicate_count, duplicate_index) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, email, password, duplicateGroupId, totalAccounts, 0],
      )

      const originalAccountId = (result as any).insertId

      // Create duplicates if requested
      if (create_duplicates && duplicate_count > 1) {
        for (let i = 1; i < duplicate_count; i++) {
          await db.query(
            `INSERT INTO premium_accounts 
             (product_id, email, password, duplicate_group_id, duplicate_count, original_account_id, duplicate_index) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, email, password, duplicateGroupId, totalAccounts, originalAccountId, i],
          )
        }
      }

      // Update product stock
      await db.query("UPDATE premium_products SET stock = stock + ? WHERE id = ?", [totalAccounts, product_id])

      await db.query("COMMIT")

      return NextResponse.json({
        message: `Account${totalAccounts > 1 ? "s" : ""} created successfully`,
        accountId: originalAccountId,
        totalCreated: totalAccounts,
      })
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Create account error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
