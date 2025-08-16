import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"


export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Starting order cleanup job...")

    await db.query("START TRANSACTION")

    try {
      // Log job start sesuai struktur tabel kamu
      const [jobResult] = await db.query(
        `
        INSERT INTO scheduled_jobs (job_type, status) 
        VALUES ('order_cleanup', 'running')
      `,
      )
      const jobId = (jobResult as any).insertId

      // Cari expired orders
      const [expiredOrderRows] = await db.query(`
        SELECT 
          o.id,
          o.order_number,
          o.user_id,
          COUNT(pa.id) as reserved_accounts
        FROM orders o
        LEFT JOIN premium_accounts pa 
          ON pa.reserved_for_order_id = o.id AND pa.status = 'reserved'
        WHERE o.status IN ('pending', 'failed')
  AND o.expires_at < NOW()
  AND o.auto_cancelled_at IS NULL

        GROUP BY o.id, o.order_number, o.user_id
      `)

      const expiredOrders = expiredOrderRows as any[]
      console.log(`📋 Found ${expiredOrders.length} expired orders to process`)

      let processedCount = 0
      let releasedAccountsTotal = 0

      for (const order of expiredOrders) {
        try {
          console.log(`⏰ Processing expired order: ${order.order_number}`)

          // Release reserved accounts
          const [releaseResult] = await db.query(
            `
            UPDATE premium_accounts 
            SET status = 'available', 
                reserved_for_order_id = NULL,
                updated_at = NOW()
            WHERE status = 'reserved' 
              AND reserved_for_order_id = ?
          `,
            [order.id],
          )

          const releasedAccounts = (releaseResult as any).affectedRows
          releasedAccountsTotal += releasedAccounts

          // Update order status
          await db.query(
            `
            UPDATE orders 
            SET status = 'cancelled',
                auto_cancelled_at = NOW(),
                cancellation_reason = 'Auto-cancelled due to payment timeout',
                updated_at = NOW()
            WHERE id = ?
          `,
            [order.id],
          )

          // Log cancellation
          await db.query(
            `
            INSERT INTO order_cancellations (
              order_id, cancelled_by_user_id, cancellation_type, reason, cancelled_at
            ) VALUES (?, NULL, 'auto', 'Payment timeout - order expired', NOW())
          `,
            [order.id],
          )

          // Remove flash sale tracking for cancelled orders
          await db.query(
            `
            DELETE FROM flash_sale_orders 
            WHERE order_id = ?
          `,
            [order.id],
          )

          processedCount++
          console.log(`✅ Order ${order.order_number} cancelled, ${releasedAccounts} accounts released`)
        } catch (orderError) {
          console.error(`❌ Error processing order ${order.order_number}:`, orderError)
        }
      }

      // Update job status
      await db.query(
        `
        UPDATE scheduled_jobs 
        SET status = 'completed', 
            processed_count = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
        [processedCount, jobId],
      )

      await db.query("COMMIT")

      console.log(
        `🎉 Cleanup completed: ${processedCount} orders processed, ${releasedAccountsTotal} accounts released`,
      )

      return NextResponse.json({
        success: true,
        message: "Order cleanup completed successfully",
        processed_orders: processedCount,
        released_accounts: releasedAccountsTotal,
        job_id: jobId,
      })
    } catch (transactionError) {
      await db.query("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Order cleanup error:", error)

    try {
      await db.query(
        `
        INSERT INTO scheduled_jobs (job_type, status, error_message) 
        VALUES ('order_cleanup', 'failed', ?)
      `,
        [error instanceof Error ? error.message : "Unknown error"],
      )
    } catch (logError) {
      console.error("Failed to log cleanup error:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Order cleanup failed",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const [jobRows] = await db.query(`
      SELECT * FROM scheduled_jobs 
      WHERE job_type = 'order_cleanup' 
      ORDER BY id DESC 
      LIMIT 5
    `)

    const jobs = jobRows as any[]

    const [expiredCountRows] = await db.query(`
      SELECT COUNT(*) as expired_count
      FROM orders 
      WHERE status = 'pending' 
        AND expires_at < NOW()
        AND auto_cancelled_at IS NULL
    `)

    const expiredCount = (expiredCountRows as any[])[0]?.expired_count || 0

    return NextResponse.json({
      recent_jobs: jobs,
      pending_expired_orders: Number.parseInt(expiredCount),
      last_cleanup: jobs[0] || null,
    })
  } catch (error) {
    console.error("Get cleanup status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
