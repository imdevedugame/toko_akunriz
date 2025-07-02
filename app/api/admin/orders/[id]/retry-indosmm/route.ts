import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { indoSMMService } from "@/lib/indosmm"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number.parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Get order details
    const [orderResult] = await db.execute(
      `
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.type = 'indosmm'
    `,
      [orderId],
    )

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      return NextResponse.json({ error: "IndoSMM order not found" }, { status: 404 })
    }

    const order = orderResult[0] as any

    // Get order items
    const [itemsResult] = await db.execute(
      `
      SELECT oii.*, s.service_id, s.name as service_name
      FROM order_indosmm_items oii
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE oii.order_id = ?
    `,
      [orderId],
    )

    if (!Array.isArray(itemsResult) || itemsResult.length === 0) {
      return NextResponse.json({ error: "Order items not found" }, { status: 404 })
    }

    const items = itemsResult as any[]

    console.log(`🔄 Admin retry IndoSMM order ${order.order_number}`)

    // Update order status to processing
    await db.execute("UPDATE orders SET status = 'processing', updated_at = NOW() WHERE id = ?", [orderId])

    // Process each item
    for (const item of items) {
      try {
        console.log(`📤 Retrying IndoSMM order for service ${item.service_name}`)

        const indoSMMResponse = await indoSMMService.createOrder(
          item.service_id,
          item.target_url,
          item.quantity,
        )

        console.log(`✅ IndoSMM retry response:`, indoSMMResponse)

        if (indoSMMResponse.order) {
          // Update order with IndoSMM order ID
          await db.execute(
            "UPDATE orders SET indosmm_order_id = ?, indosmm_status = ?, updated_at = NOW() WHERE id = ?",
            [indoSMMResponse.order.toString(), "In Progress", orderId],
          )

          // Update item with IndoSMM order ID
          await db.execute("UPDATE order_indosmm_items SET indosmm_order_id = ? WHERE id = ?", [
            indoSMMResponse.order.toString(),
            item.id,
          ])

          console.log(`✅ Order ${order.order_number} retry successful - IndoSMM Order ID: ${indoSMMResponse.order}`)
        } else {
          throw new Error("No order ID returned from IndoSMM")
        }
      } catch (itemError) {
        console.error(`❌ Failed to retry item ${item.id}:`, itemError)

        // Update order status to failed
        await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])

        throw itemError
      }
    }

    console.log(`🎉 IndoSMM order ${order.order_number} retry completed successfully`)

    return NextResponse.json({
      success: true,
      message: "IndoSMM order retry successful",
      order_number: order.order_number,
    })
  } catch (error) {
    console.error("Retry IndoSMM order error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to retry IndoSMM order",
      },
      { status: 500 },
    )
  }
}
