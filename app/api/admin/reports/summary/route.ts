import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const yesterdayStart = startOfDay(subDays(now, 1))
    const yesterdayEnd = endOfDay(subDays(now, 1))
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)

    const getOrderStats = async (from: Date, to: Date) => {
      const [[orders], [socials]] = await Promise.all([
        db.execute(
          `SELECT COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue
           FROM orders 
           WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')`,
          [from.toISOString(), to.toISOString()]
        ),
        db.execute(
          `SELECT COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue
           FROM social_orders 
           WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')`,
          [from.toISOString(), to.toISOString()]
        ),
      ])
      return {
        orders: (orders as any).orders + (socials as any).orders,
        revenue: (orders as any).revenue + (socials as any).revenue,
      }
    }

    const [
      todayStats,
      yesterdayStats,
      monthStats,
      yearStats,
      [pendingOrders],
      [pendingSocial],
      [recentOrders],
      [recentSocial]
    ] = await Promise.all([
      getOrderStats(todayStart, todayEnd),
      getOrderStats(yesterdayStart, yesterdayEnd),
      getOrderStats(monthStart, monthEnd),
      getOrderStats(yearStart, yearEnd),
      db.execute(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`),
      db.execute(`SELECT COUNT(*) as count FROM social_orders WHERE status = 'pending'`),
      db.execute(`
        SELECT order_number, total_amount, status, type, created_at, 'orders' as source
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
      `),
      db.execute(`
        SELECT order_number, total_amount, status, 'social_media' as type, created_at, 'social_orders' as source
        FROM social_orders 
        ORDER BY created_at DESC 
        LIMIT 5
      `),
    ])

    const summary = {
      today: todayStats,
      yesterday: yesterdayStats,
      thisMonth: monthStats,
      thisYear: yearStats,
      pending: {
        orders: (pendingOrders as any[])[0].count + (pendingSocial as any[])[0].count,
      },
      recentActivity: [...(recentOrders as any[]), ...(recentSocial as any[])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Summary reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
