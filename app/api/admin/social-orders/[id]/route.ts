import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const [orderRows] = await db.execute(
      `
      SELECT 
        so.*,
        u.email as user_email,
        u.name as user_name,
        u.role as user_role,
        ss.name as service_name,
        ss.service_type,
        sc.name as category_name,
        sp.name as package_name
      FROM social_orders so
      JOIN users u ON so.user_id = u.id
      JOIN social_services ss ON so.service_id = ss.id
      JOIN social_categories sc ON ss.category_id = sc.id
      LEFT JOIN service_packages sp ON so.package_id = sp.id
      WHERE so.id = ?
    `,
      [params.id],
    )

    const orders = orderRows as any[]
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: orders[0] })
  } catch (error) {
    console.error("Failed to fetch social order:", error)
    return NextResponse.json({ error: "Failed to fetch social order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const validStatuses = ["pending", "processing", "completed", "cancelled", "refunded"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update order status
    const updateFields = ["status = ?"]
    const updateValues = [status]

    if (notes) {
      updateFields.push("notes = CONCAT(COALESCE(notes, ''), '\n\nAdmin Note: ', ?)")
      updateValues.push(notes)
    }

    // Set timestamps based on status
    if (status === "processing") {
      updateFields.push("started_at = CURRENT_TIMESTAMP")
    } else if (status === "completed") {
      updateFields.push("completed_at = CURRENT_TIMESTAMP")
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(params.id)

    await db.execute(`UPDATE social_orders SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    return NextResponse.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Failed to update social order:", error)
    return NextResponse.json({ error: "Failed to update social order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params

    // Check if order can be deleted (only pending orders)
    const [orderRows] = await db.execute("SELECT status FROM social_orders WHERE id = ?", [params.id])
    const orders = orderRows as any[]

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (orders[0].status !== "pending") {
      return NextResponse.json({ error: "Can only delete pending orders" }, { status: 400 })
    }

    await db.execute("DELETE FROM social_orders WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Failed to delete social order:", error)
    return NextResponse.json({ error: "Failed to delete social order" }, { status: 500 })
  }
}
