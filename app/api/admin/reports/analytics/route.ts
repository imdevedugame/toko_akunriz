import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { subDays, startOfDay, endOfDay } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const fromDate = subDays(new Date(), days)
    const toDate = new Date()

    // Conversion Funnel Analysis
    const [registeredUsers] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE created_at BETWEEN ? AND ?`, [
      startOfDay(fromDate).toISOString(),
      endOfDay(toDate).toISOString(),
    ])

    const [orderingUsers] = await db.execute(
      `
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
        UNION
        SELECT user_id FROM social_orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
      ) combined
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    const [paidUsers] = await db.execute(
      `
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM orders WHERE created_at BETWEEN ? AND ? AND status IN ('paid', 'completed')
        UNION
        SELECT user_id FROM social_orders WHERE created_at BETWEEN ? AND ? AND payment_status = 'paid'
      ) combined
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Customer Lifetime Value
    const [customerLTV] = await db.execute(
      `
      SELECT 
        AVG(total_spent) as avg_ltv,
        MIN(total_spent) as min_ltv,
        MAX(total_spent) as max_ltv
      FROM (
        SELECT 
          user_id,
          SUM(total_spent) as total_spent
        FROM (
          SELECT user_id, SUM(total_amount) as total_spent
          FROM orders 
          WHERE status NOT IN ('cancelled', 'failed')
          GROUP BY user_id
          
          UNION ALL
          
          SELECT user_id, SUM(total_amount) as total_spent
          FROM social_orders 
          WHERE status NOT IN ('cancelled', 'refunded')
          GROUP BY user_id
        ) combined
        GROUP BY user_id
      ) customer_totals
    `,
    )

    // Order Frequency Distribution
    const [orderFrequency] = await db.execute(
      `
      SELECT 
        order_count,
        COUNT(*) as customer_count
      FROM (
        SELECT 
          user_id,
          COUNT(*) as order_count
        FROM (
          SELECT user_id FROM orders WHERE status NOT IN ('cancelled', 'failed')
          UNION ALL
          SELECT user_id FROM social_orders WHERE status NOT IN ('cancelled', 'refunded')
        ) combined
        GROUP BY user_id
      ) user_orders
      GROUP BY order_count
      ORDER BY order_count
    `,
    )

    // Peak Hours Analysis
    const [peakHours] = await db.execute(
      `
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as order_count,
        AVG(total_amount) as avg_amount
      FROM (
        SELECT created_at, total_amount FROM orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
        UNION ALL
        SELECT created_at, total_amount FROM social_orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
      ) combined
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Weekly Trends
    const [weeklyTrends] = await db.execute(
      `
      SELECT 
        WEEKDAY(created_at) as day_of_week,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM (
        SELECT created_at, total_amount FROM orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
        UNION ALL
        SELECT created_at, total_amount FROM social_orders WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
      ) combined
      GROUP BY WEEKDAY(created_at)
      ORDER BY day_of_week
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Service Category Performance
    const [categoryPerformance] = await db.execute(
      `
      SELECT 
        'Premium Account' as category,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders 
      WHERE type = 'premium_account' AND created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
      
      UNION ALL
      
      SELECT 
        'IndoSMM Service' as category,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders 
      WHERE type = 'indosmm_service' AND created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
      
      UNION ALL
      
      SELECT 
        'Social Media Service' as category,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

    const analytics = {
      conversionFunnel: {
        registered: (registeredUsers as any[])[0].count,
        ordered: (orderingUsers as any[])[0].count,
        paid: (paidUsers as any[])[0].count,
        conversionRate: {
          orderConversion:
            (registeredUsers as any[])[0].count > 0
              ? ((orderingUsers as any[])[0].count / (registeredUsers as any[])[0].count) * 100
              : 0,
          paymentConversion:
            (orderingUsers as any[])[0].count > 0
              ? ((paidUsers as any[])[0].count / (orderingUsers as any[])[0].count) * 100
              : 0,
        },
      },
      customerLTV: {
        average: (customerLTV as any[])[0]?.avg_ltv || 0,
        minimum: (customerLTV as any[])[0]?.min_ltv || 0,
        maximum: (customerLTV as any[])[0]?.max_ltv || 0,
      },
      orderFrequency: orderFrequency as any[],
      peakHours: (peakHours as any[]).map((item) => ({
        hour: `${item.hour}:00`,
        orderCount: item.order_count,
        avgAmount: item.avg_amount,
      })),
      weeklyTrends: (weeklyTrends as any[]).map((item) => ({
        day: dayNames[item.day_of_week],
        orderCount: item.order_count,
        revenue: item.revenue,
      })),
      categoryPerformance: categoryPerformance as any[],
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
