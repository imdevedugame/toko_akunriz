import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import type { RowDataPacket } from "mysql2"  // Import tipe RowDataPacket

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Premium Account Orders Stats
    const [premiumStatsRows] = await db.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_revenue,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status = 'pending' AND expires_at IS NOT NULL AND expires_at <= NOW() THEN 1 END) as expired_orders
      FROM orders
    `)

    // Social Media Orders Stats
    const [socialStatsRows] = await db.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_revenue,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        0 as expired_orders
      FROM social_orders
    `)

    const premiumStats = premiumStatsRows[0]
    const socialStats = socialStatsRows[0]

    // Safety check kalau kosong
    if (!premiumStats || !socialStats) {
      return NextResponse.json({ error: "Failed to retrieve order stats" }, { status: 500 })
    }

    const combinedStats = {
      total_orders: premiumStats.total_orders + socialStats.total_orders,
      total_revenue: premiumStats.total_revenue + socialStats.total_revenue,
      pending_orders: premiumStats.pending_orders + socialStats.pending_orders,
      pending_revenue: premiumStats.pending_revenue + socialStats.pending_revenue,
      completed_orders: premiumStats.completed_orders + socialStats.completed_orders,
      completed_revenue: premiumStats.completed_revenue + socialStats.completed_revenue,
      cancelled_orders: premiumStats.cancelled_orders + socialStats.cancelled_orders,
      expired_orders: premiumStats.expired_orders + socialStats.expired_orders,

      premium_account: {
        total_orders: premiumStats.total_orders,
        total_revenue: premiumStats.total_revenue,
        pending_orders: premiumStats.pending_orders,
        completed_orders: premiumStats.completed_orders,
        cancelled_orders: premiumStats.cancelled_orders,
        expired_orders: premiumStats.expired_orders,
      },
      social_media: {
        total_orders: socialStats.total_orders,
        total_revenue: socialStats.total_revenue,
        pending_orders: socialStats.pending_orders,
        completed_orders: socialStats.completed_orders,
        cancelled_orders: socialStats.cancelled_orders,
      }
    }

    return NextResponse.json({ stats: combinedStats })
  } catch (error) {
    console.error("Failed to fetch order stats:", error)
    return NextResponse.json({ error: "Failed to fetch order stats" }, { status: 500 })
  }
}
