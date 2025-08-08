import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderNumber } = params
    const body = await request.json()
    const { reason } = body

    console.log(`🚫 User ${user.id} requesting to cancel order: ${orderNumber}`)

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      // Get order details
      const [orderRows] = await db.query(
        `
        SELECT 
          o.*,
          CASE 
            WHEN o.expires_at < NOW() THEN 'expired'
            WHEN o.status = 'pending' THEN 'cancellable'
            ELSE 'not_cancellable'
          END as cancellation_status
        FROM orders o
        WHERE o.order_number = ? AND o.user_id = ?
      `,
        [orderNumber, user.id],
      )

      const order = (orderRows as any[])[0]
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Check if order can be cancelled
      if (order.status !== "pending") {
        return NextResponse.json(
          {
            error: "Order cannot be cancelled",
            details: `Order status is '${order.status}'. Only pending orders can be cancelled.`,
          },
          { status: 400 },
        )
      }

      // Check if order is already expired (auto-cancellation should handle this)
      if (order.cancellation_status === "expired") {
        return NextResponse.json(
          {
            error: "Order has expired",
            details: "This order has expired and will be automatically cancelled soon.",
          },
          { status: 400 },
        )
      }

      console.log(`📋 Order ${orderNumber} is eligible for cancellation`)

      // Get reserved accounts for this order
      const [reservedAccountsRows] = await db.query(
        `
        SELECT 
          pa.id,
          pa.product_id,
          pa.email,
          p.name as product_name
        FROM premium_accounts pa
        JOIN premium_products p ON pa.product_id = p.id
        WHERE pa.status = 'reserved' 
          AND pa.reserved_for_order_id = ?
      `,
        [order.id],
      )

      const reservedAccounts = reservedAccountsRows as any[]
      console.log(`🔒 Found ${reservedAccounts.length} reserved accounts to release`)

      // Release reserved accounts back to available
      if (reservedAccounts.length > 0) {
        await db.query(
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

        console.log(`✅ Released ${reservedAccounts.length} accounts back to available`)
      }

      // Update order status to cancelled
      await db.query(
        `
        UPDATE orders 
        SET status = 'cancelled',
            cancellation_reason = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
        [reason || "Cancelled by user", order.id],
      )

      // Log cancellation
      await db.query(
        `
        INSERT INTO order_cancellations (
          order_id, cancelled_by_user_id, cancellation_type, reason, cancelled_at
        ) VALUES (?, ?, 'manual', ?, NOW())
      `,
        [order.id, user.id, reason || "Cancelled by user"],
      )

      // Remove flash sale tracking for cancelled orders
      await db.query(
        `
        DELETE FROM flash_sale_orders 
        WHERE order_id = ?
      `,
        [order.id],
      )

      // Commit transaction
      await db.query("COMMIT")

      console.log(`❌ Successfully cancelled order: ${orderNumber}`)

      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully",
        order: {
          id: order.id,
          order_number: orderNumber,
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          released_accounts: reservedAccounts.length,
        },
      })
    } catch (transactionError) {
      await db.query("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel order",
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
