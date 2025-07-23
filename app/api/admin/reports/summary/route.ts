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
    const today = startOfDay(now)
    const tomorrow = endOfDay(now)
    const yesterday = startOfDay(subDays(now, 1))
    const yesterdayEnd = endOfDay(subDays(now, 1))
    const thisMonth = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const thisYear = startOfYear(now)
    const thisYearEnd = endOfYear(now)

    // Today's stats
    const [todayOrders] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [today.toISOString(), tomorrow.toISOString()],
    )

    const [todaySocial] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [today.toISOString(), tomorrow.toISOString()],
    )

    // Yesterday's stats
    const [yesterdayOrders] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [yesterday.toISOString(), yesterdayEnd.toISOString()],
    )

    const [yesterdaySocial] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [yesterday.toISOString(), yesterdayEnd.toISOString()],
    )

    // This month's stats
    const [thisMonthOrders] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [thisMonth.toISOString(), thisMonthEnd.toISOString()],
    )

    const [thisMonthSocial] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [thisMonth.toISOString(), thisMonthEnd.toISOString()],
    )

    // This year's stats
    const [thisYearOrders] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [thisYear.toISOString(), thisYearEnd.toISOString()],
    )

    const [thisYearSocial] = await db.execute(
      `
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [thisYear.toISOString(), thisYearEnd.toISOString()],
    )

    // Pending orders
    const [pendingOrders] = await db.execute(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `)

    const [pendingSocial] = await db.execute(`
      SELECT COUNT(*) as count FROM social_orders WHERE status = 'pending'
    `)

    // Recent activity
    const [recentOrders] = await db.execute(
      `
      SELECT 
        order_number,
        total_amount,
        status,
        type,
        created_at,
        'orders' as source
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `,
    )

    const [recentSocial] = await db.execute(
      `
      SELECT 
        order_number,
        total_amount,
        status,
        'social_media' as type,
        created_at,
        'social_orders' as source
      FROM social_orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `,
    )

    const todayData = (todayOrders as any[])[0]
    const todaySocialData = (todaySocial as any[])[0]
    const yesterdayData = (yesterdayOrders as any[])[0]
    const yesterdaySocialData = (yesterdaySocial as any[])[0]
    const thisMonthData = (thisMonthOrders as any[])[0]
    const thisMonthSocialData = (thisMonthSocial as any[])[0]
    const thisYearData = (thisYearOrders as any[])[0]
    const thisYearSocialData = (thisYearSocial as any[])[0]

    const summary = {
      today: {
        orders: todayData.orders + todaySocialData.orders,
        revenue: todayData.revenue + todaySocialData.revenue,
      },
      yesterday: {
        orders: yesterdayData.orders + yesterdaySocialData.orders,
        revenue: yesterdayData.revenue + yesterdaySocialData.revenue,
      },
      thisMonth: {
        orders: thisMonthData.orders + thisMonthSocialData.orders,
        revenue: thisMonthData.revenue + thisMonthSocialData.revenue,
      },
      thisYear: {
        orders: thisYearData.orders + thisYearSocialData.orders,
        revenue: thisYearData.revenue + thisYearSocialData.revenue,
      },
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
