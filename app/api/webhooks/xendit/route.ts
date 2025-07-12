
import { type NextRequest, NextResponse } from "next/server"
import { indoSMMService } from "@/lib/indosmm"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔔 Xendit webhook received:", JSON.stringify(body, null, 2))

    const { id, status, external_id, amount } = body

    console.log("📦 Webhook data:", { id, status, external_id, amount })

    if (!external_id) {
      console.log("❌ No external_id in webhook")
      return NextResponse.json({ error: "No external_id provided" }, { status: 400 })
    }

    const [orderResult] = await db.execute("SELECT * FROM orders WHERE order_number = ?", [external_id])
    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      console.log(`❌ Order not found for external_id: ${external_id}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0] as any
    console.log(`📋 Order found: ${order.order_number}, Current status: ${order.status}, Type: ${order.type}`)

    // Handle PAID or COMPLETED
    if ((status === "PAID" || status === "COMPLETED") && order.status !== "completed") {
      console.log(`💰 Payment successful for order: ${order.order_number}`)

      await db.execute("UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?", [order.id])
      console.log(`✅ Order status updated to 'paid': ${order.order_number}`)

      if (order.type === "indosmm_service") {
        console.log(`🚀 IndoSMM service order detected`)
        await processIndoSMMOrder(order.id)
      } else if (order.type === "premium_account") {
        console.log(`👑 Premium account order detected`)
        await processPremiumAccountOrder(order.id)
      } else {
        console.warn(`⚠️ Unknown order type: ${order.type}`)
      }
    }

    // Handle failed or expired
    else if (status === "FAILED" || status === "EXPIRED") {
      console.log(`❌ Payment failed or expired for order: ${order.order_number}`)
      await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [order.id])
    } else {
      console.log(`ℹ️ No action taken. Status: ${status}, Current order status: ${order.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}



async function processIndoSMMOrder(orderId: number) {
  try {
    console.log(`🔄 Processing IndoSMM order ID: ${orderId}`)

    const [orderResult] = await db.execute(
      `
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [orderId]
    )

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      throw new Error("Order not found")
    }

    const order = orderResult[0] as any

    if (order.indosmm_order_id) {
      console.log(`⚠️ Order ${order.order_number} already has IndoSMM order ID: ${order.indosmm_order_id}`)
      return
    }

    const [itemsResult] = await db.execute(
      `
      SELECT oii.*, s.service_id, s.name as service_name
      FROM order_indosmm_items oii
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE oii.order_id = ?
    `,
      [orderId]
    )

    if (!Array.isArray(itemsResult) || itemsResult.length === 0) {
      throw new Error("Order items not found")
    }

    const items = itemsResult as any[]
    console.log(`📦 Found ${items.length} items for order ${order.order_number}`)

    await db.execute("UPDATE orders SET status = 'processing', updated_at = NOW() WHERE id = ?", [orderId])

    for (const item of items) {
      try {
        console.log(
          `📤 Sending to IndoSMM - Service: ${item.service_name}, Target: ${item.target}, Quantity: ${item.quantity}`
        )

        const indoSMMResponse = await indoSMMService.createOrder(
          item.service_id,
          item.target, // ✅ Perbaikan di sini
          item.quantity
        )

        console.log(`✅ IndoSMM response:`, indoSMMResponse)

        if (indoSMMResponse.order) {
          await db.execute(
            "UPDATE orders SET indosmm_order_id = ?, indosmm_status = ?, updated_at = NOW() WHERE id = ?",
            [indoSMMResponse.order.toString(), "In Progress", orderId]
          )

          await db.execute(
            "UPDATE order_indosmm_items SET indosmm_order_id = ?, indosmm_status = 'processing' WHERE id = ?",
            [indoSMMResponse.order.toString(), item.id]
          )

          console.log(
            `✅ Order ${order.order_number} sent to IndoSMM successfully - Order ID: ${indoSMMResponse.order}`
          )
        } else {
          throw new Error("No order ID returned from IndoSMM")
        }
      } catch (itemError) {
        console.error(`❌ Failed to process item ${item.id}:`, itemError)
        await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])
        throw itemError
      }
    }

    console.log(`🎉 IndoSMM order ${order.order_number} processed successfully`)
  } catch (error) {
    console.error(`❌ Failed to process IndoSMM order ${orderId}:`, error)
    await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])
    throw error
  }
}
async function processPremiumAccountOrder(orderId: number) {
  try {
    console.log("🔐 Processing premium account order:", orderId)

    const [items] = await db.execute(
      "SELECT * FROM order_premium_items WHERE order_id = ?",
      [orderId]
    )

    const itemList = items as any[]

    if (itemList.length === 0) {
      console.error("❌ No order items found for premium_account")
      await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])
      return
    }

    for (const item of itemList) {
      console.log(`🔍 Processing item: ${item.product_id}`)

      const [accountRows] = await db.execute(
        "SELECT * FROM premium_accounts WHERE product_id = ? AND status = 'available' LIMIT 1",
        [item.product_id]
      )

      const accounts = accountRows as any[]
      if (accounts.length === 0) {
        console.error(`❌ No available premium accounts for product: ${item.product_id}`)
        await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])
        return
      }

      const account = accounts[0]
      console.log(`✅ Assigning premium account ID: ${account.id} to order`)

      await db.execute(
        `UPDATE premium_accounts 
         SET status = 'sold', order_id = ?, updated_at = NOW() 
         WHERE id = ?`,
        [orderId, account.id]
      )
    }

    await db.execute("UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = ?", [orderId])
    console.log("✅ Premium account order marked as completed")
  } catch (error) {
    console.error("💥 Premium account order processing failed:", error)
    await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId])
  }
}

