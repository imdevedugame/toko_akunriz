import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { parse } from "csv-parse/sync"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const productId = formData.get("product_id") as string

    if (!file || !productId) {
      return NextResponse.json({ error: "Missing file or product ID" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const csvString = buffer.toString("utf-8")

    let records: any[]
    try {
      records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
      })
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid CSV format" }, { status: 400 })
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      const email = row.email?.trim()
      const password = row.password?.trim()

      if (!email || !password) {
        errorCount++
        errors.push(`Row ${i + 2}: Email or password is missing`)
        continue
      }

      try {
        const [existing] = await db.execute(
          "SELECT id FROM premium_accounts WHERE email = ? AND product_id = ?",
          [email, productId]
        )

        if ((existing as any[]).length > 0) {
          errorCount++
          errors.push(`Row ${i + 2}: Account already exists`)
          continue
        }

        await db.execute(
          "INSERT INTO premium_accounts (product_id, email, password) VALUES (?, ?, ?)",
          [productId, email, password]
        )

        successCount++
      } catch (insertError: any) {
        errorCount++
        errors.push(`Row ${i + 2}: ${insertError.message || "Insert error"}`)
      }
    }

    await db.execute("UPDATE premium_products SET stock = stock + ? WHERE id = ?", [successCount, productId])

    return NextResponse.json({
      total_processed: records.length,
      success_count: successCount,
      error_count: errorCount,
      errors,
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
