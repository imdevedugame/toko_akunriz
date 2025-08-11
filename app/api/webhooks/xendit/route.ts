import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { indoSMMService } from "@/lib/indosmm";

export async function POST(request: NextRequest) {
  // Debug: Log semua header yang masuk dari Xendit
  const headers = Object.fromEntries(request.headers);
  console.log("📩 Incoming Webhook Headers:", headers);

  // Validasi token webhook dari header (pastikan sama dengan yang di dashboard Xendit)
  const token = request.headers.get("x-callback-token");
  if (!process.env.XENDIT_WEBHOOK_TOKEN) {
    console.warn("⚠️ XENDIT_WEBHOOK_TOKEN not set in env — skipping token validation for testing");
  } else if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    console.log("❌ Unauthorized webhook request: invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("🔔 Xendit webhook received:", JSON.stringify(body, null, 2));

    const { status, external_id } = body;

    if (!external_id) {
      console.log("❌ No external_id in webhook");
      return NextResponse.json({ error: "No external_id provided" }, { status: 400 });
    }

    // Cari order berdasarkan external_id
    const [orderResult] = await db.execute("SELECT * FROM orders WHERE order_number = ?", [external_id]);
    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      console.log(`❌ Order not found for external_id: ${external_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult[0] as any;
    console.log(`📋 Order found: ${order.order_number}, Current status: ${order.status}, Type: ${order.type}`);

    // Handle payment success
    if ((status === "PAID" || status === "COMPLETED") && order.status !== "completed") {
      if (order.type === "premium_account") {
        console.log(`👑 Premium account order detected`);
        await processPremiumAccountOrder(order.id);
      } else if (order.type === "indosmm_service") {
        console.log(`🚀 IndoSMM service order detected`);
        await db.execute("UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?", [order.id]);
        await processIndoSMMOrder(order.id);
      } else {
        console.warn(`⚠️ Unknown order type: ${order.type}`);
      }
    }
    // Handle failed or expired
    else if (status === "FAILED" || status === "EXPIRED") {
      console.log(`❌ Payment failed or expired for order: ${order.order_number}`);
      await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [order.id]);
    } else {
      console.log(`ℹ️ No action taken. Status: ${status}, Current order status: ${order.status}`);
    }

    console.log(`✅ Webhook processed successfully for order: ${order.order_number}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function processPremiumAccountOrder(orderId: number) {
  try {
    console.log("🔐 Processing premium account order:", orderId);

    const [items] = await db.execute("SELECT * FROM order_premium_items WHERE order_id = ?", [orderId]);
    const itemList = items as any[];

    if (itemList.length === 0) {
      console.error("❌ No order items found for premium_account");
      await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId]);
      return;
    }

    for (const item of itemList) {
      const [accountRows] = await db.execute(
        `SELECT * FROM premium_accounts 
         WHERE product_id = ? AND status = 'reserved' AND reserved_for_order_id = ?
         LIMIT 1`,
        [item.product_id, orderId]
      );

      const accounts = accountRows as any[];
      if (accounts.length === 0) {
        console.error(`❌ No reserved premium accounts for product: ${item.product_id}`);
        await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId]);
        return;
      }

      const account = accounts[0];
      console.log(`✅ Selling reserved account ID: ${account.id} for order`);

      await db.execute(
        `UPDATE premium_accounts 
         SET status = 'sold', order_id = ?, updated_at = NOW() 
         WHERE id = ?`,
        [orderId, account.id]
      );
    }

    await db.execute("UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = ?", [orderId]);
    console.log("✅ Premium account order marked as completed");
  } catch (error) {
    console.error("💥 Premium account order processing failed:", error);
    await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId]);
  }
}

async function processIndoSMMOrder(orderId: number) {
  try {
    console.log(`🔄 Processing IndoSMM order ID: ${orderId}`);

    const [orderResult] = await db.execute(
      `
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [orderId]
    );

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderResult[0] as any;
    if (order.indosmm_order_id) {
      console.log(`⚠️ Order ${order.order_number} already has IndoSMM order ID`);
      return;
    }

    const [itemsResult] = await db.execute(
      `
      SELECT oii.*, s.service_id, s.name as service_name
      FROM order_indosmm_items oii
      JOIN indosmm_services s ON oii.service_id = s.id
      WHERE oii.order_id = ?
    `,
      [orderId]
    );

    const items = itemsResult as any[];
    if (items.length === 0) throw new Error("Order items not found");

    await db.execute("UPDATE orders SET status = 'processing', updated_at = NOW() WHERE id = ?", [orderId]);

    for (const item of items) {
      const response = await indoSMMService.createOrder(item.service_id, item.target, item.quantity);

      if (response.order) {
        await db.execute(
          "UPDATE orders SET indosmm_order_id = ?, indosmm_status = ?, updated_at = NOW() WHERE id = ?",
          [response.order.toString(), "In Progress", orderId]
        );

        await db.execute(
          "UPDATE order_indosmm_items SET indosmm_order_id = ?, indosmm_status = 'processing' WHERE id = ?",
          [response.order.toString(), item.id]
        );

        console.log(`✅ IndoSMM order sent - ID: ${response.order}`);
      } else {
        throw new Error("No order ID returned from IndoSMM");
      }
    }

    console.log(`🎉 IndoSMM order processed successfully`);
  } catch (error) {
    console.error(`❌ Failed to process IndoSMM order ${orderId}:`, error);
    await db.execute("UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?", [orderId]);
  }
}
