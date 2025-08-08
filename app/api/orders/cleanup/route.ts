import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Starting order cleanup job...")

    // Start transaction
    await db.execute("START TRANSACTION")

    try {
      // Log job start
      const [jobResult] = await db.execute(
        `
        INSERT INTO scheduled_jobs (job_name, status, started_at) 
        VALUES ('order_cleanup', 'running', NOW())
      `,
      )
      const jobId = (jobResult as any).insertId

      // Find expired orders
      const [expiredOrderRows] = await db.execute(`
        SELECT 
          o.id,
          o.order_number,
          o.user_id,
          COUNT(pa.id) as reserved_accounts
        FROM orders o
        LEFT JOIN premium_accounts pa ON pa.reserved_for_order_id = o.id AND pa.status = 'reserved'
        WHERE o.status = 'pending' 
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
          const [releaseResult] = await db.execute(
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
          await db.execute(
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
          await db.execute(
            `
            INSERT INTO order_cancellations (
              order_id, cancelled_by_user_id, cancellation_type, reason, cancelled_at
            ) VALUES (?, NULL, 'auto', 'Payment timeout - order expired', NOW())
          `,
            [order.id],
          )

          // Remove flash sale tracking for cancelled orders
          await db.execute(
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
          // Continue with other orders
        }
      }

      // Update job status
      await db.execute(
        `
        UPDATE scheduled_jobs 
        SET status = 'completed', 
            completed_at = NOW(),
            processed_count = ?
        WHERE id = ?
      `,
        [processedCount, jobId],
      )

      // Commit transaction
      await db.execute("COMMIT")

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
      await db.execute("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Order cleanup error:", error)

    // Try to log the error
    try {
      await db.execute(
        `
        INSERT INTO scheduled_jobs (job_name, status, started_at, completed_at, error_message) 
        VALUES ('order_cleanup', 'failed', NOW(), NOW(), ?)
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
    // Get recent cleanup job status
    const [jobRows] = await db.execute(`
      SELECT * FROM scheduled_jobs 
      WHERE job_name = 'order_cleanup' 
      ORDER BY started_at DESC 
      LIMIT 5
    `)

    const jobs = jobRows as any[]

    // Get current expired orders count
    const [expiredCountRows] = await db.execute(`
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
