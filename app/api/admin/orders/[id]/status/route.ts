import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = Number.parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ["pending", "paid", "processing", "completed", "failed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if order exists
    const [existingOrder] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId])

    if (!Array.isArray(existingOrder) || existingOrder.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = existingOrder[0] as any

    // Update order status
    await db.execute("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, orderId])

    // If it's an IndoSMM order and status is being set to completed,
    // we might want to update the IndoSMM status as well
    if (order.type === "indosmm" && status === "completed") {
      await db.execute("UPDATE orders SET indosmm_status = ? WHERE id = ?", ["Completed", orderId])
    }

    // Log the status change
    console.log(`Order ${order.order_number} status updated from ${order.status} to ${status} by admin ${user.email}`)

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: orderId,
        status,
        updated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
