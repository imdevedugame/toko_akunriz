import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromDate = new Date(searchParams.get("from") || subDays(new Date(), 30))
    const toDate = new Date(searchParams.get("to") || new Date())

    // Calculate previous period for growth comparison
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevFromDate = subDays(fromDate, daysDiff)
    const prevToDate = subDays(toDate, daysDiff)

    // Current period stats from orders table
    const [currentOrderStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Current period stats from social_orders table
    const [currentSocialStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Previous period stats from orders table
    const [prevOrderStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
    `,
      [startOfDay(prevFromDate).toISOString(), endOfDay(prevToDate).toISOString()],
    )

    // Previous period stats from social_orders table
    const [prevSocialStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [startOfDay(prevFromDate).toISOString(), endOfDay(prevToDate).toISOString()],
    )

    // Combine current and previous stats
    const currentOrder = (currentOrderStats as any[])[0]
    const currentSocial = (currentSocialStats as any[])[0]
    const prevOrder = (prevOrderStats as any[])[0]
    const prevSocial = (prevSocialStats as any[])[0]
const current = {
  totalOrders: Number(currentOrder.totalOrders) + Number(currentSocial.totalOrders),
  totalRevenue: Number(currentOrder.totalRevenue) + Number(currentSocial.totalRevenue),
  totalCustomers: Number(currentOrder.totalCustomers) + Number(currentSocial.totalCustomers),
}

const previous = {
  totalOrders: Number(prevOrder.totalOrders) + Number(prevSocial.totalOrders),
  totalRevenue: Number(prevOrder.totalRevenue) + Number(prevSocial.totalRevenue),
  totalCustomers: Number(prevOrder.totalCustomers) + Number(prevSocial.totalCustomers),
}

    // Calculate growth percentages
    const revenueGrowth =
      previous.totalRevenue > 0 ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0
    const orderGrowth =
      previous.totalOrders > 0 ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 : 0
    const customerGrowth =
      previous.totalCustomers > 0
        ? ((current.totalCustomers - previous.totalCustomers) / previous.totalCustomers) * 100
        : 0

    // Daily revenue data from both tables
    const [dailyOrderRevenue] = await db.execute(
      `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    const [dailySocialRevenue] = await db.execute(
      `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Combine daily revenue data
    const dailyRevenueMap = new Map()
    ;(dailyOrderRevenue as any[]).forEach((item) => {
      const dateStr = item.date
      dailyRevenueMap.set(dateStr, {
        date: dateStr,
        revenue: item.revenue,
        orders: item.orders,
      })
    })
    ;(dailySocialRevenue as any[]).forEach((item) => {
      const dateStr = item.date
      const existing = dailyRevenueMap.get(dateStr)
      if (existing) {
        existing.revenue += item.revenue
        existing.orders += item.orders
      } else {
        dailyRevenueMap.set(dateStr, {
          date: dateStr,
          revenue: item.revenue,
          orders: item.orders,
        })
      }
    })

    const dailyRevenue = Array.from(dailyRevenueMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // Monthly revenue data
    const [monthlyOrderRevenue] = await db.execute(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    const [monthlySocialRevenue] = await db.execute(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Combine monthly revenue data
    const monthlyRevenueMap = new Map()
    ;(monthlyOrderRevenue as any[]).forEach((item) => {
      monthlyRevenueMap.set(item.month, {
        month: item.month,
        revenue: item.revenue,
        orders: item.orders,
      })
    })
    ;(monthlySocialRevenue as any[]).forEach((item) => {
      const existing = monthlyRevenueMap.get(item.month)
      if (existing) {
        existing.revenue += item.revenue
        existing.orders += item.orders
      } else {
        monthlyRevenueMap.set(item.month, {
          month: item.month,
          revenue: item.revenue,
          orders: item.orders,
        })
      }
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.values()).sort((a, b) => a.month.localeCompare(b.month))

    // Service/Product sales data from orders table
    const [orderSales] = await db.execute(
      `
      SELECT 
        CASE 
          WHEN type = 'premium_account' THEN 'Premium Account'
          WHEN type = 'indosmm_service' THEN 'IndoSMM Service'
          ELSE type
        END as name,
        COUNT(*) as sales,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
      GROUP BY type
      ORDER BY sales DESC
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Social media service sales data
    const [socialSales] = await db.execute(
      `
      SELECT 
        'Social Media Service' as name,
        COUNT(*) as sales,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Combine all sales data
    const allSales = [...(orderSales as any[]), ...(socialSales as any[])]
      .filter((item) => item.sales > 0)
      .sort((a, b) => b.sales - a.sales)

    // Orders by status from orders table
    const [ordersByStatus] = await db.execute(
      `
      SELECT 
        status,
        COUNT(*) as count,
        'orders' as source
      FROM orders 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY status
      
      UNION ALL
      
      SELECT 
        status,
        COUNT(*) as count,
        'social_orders' as source
      FROM social_orders 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY status
      
      ORDER BY count DESC
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Revenue by type
    const totalRevenueAll = current.totalRevenue
    const revenueByType = allSales.map((item) => ({
      type: item.name,
      revenue: item.revenue,
      percentage: totalRevenueAll > 0 ? (item.revenue / totalRevenueAll) * 100 : 0,
    }))

    // Top customers (combining both tables)
    const [topCustomers] = await db.execute(
      `
      SELECT 
        u.name,
        u.email,
        COALESCE(order_spent, 0) + COALESCE(social_spent, 0) as totalSpent,
        COALESCE(order_count, 0) + COALESCE(social_count, 0) as orderCount
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          SUM(total_amount) as order_spent,
          COUNT(*) as order_count
        FROM orders 
        WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'failed')
        GROUP BY user_id
      ) o ON u.id = o.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          SUM(total_amount) as social_spent,
          COUNT(*) as social_count
        FROM social_orders 
        WHERE created_at BETWEEN ? AND ? AND status NOT IN ('cancelled', 'refunded')
        GROUP BY user_id
      ) s ON u.id = s.user_id
      WHERE (COALESCE(order_spent, 0) + COALESCE(social_spent, 0)) > 0
      ORDER BY totalSpent DESC
      LIMIT 20
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Get total products/services count
    const [productCount] = await db.execute('SELECT COUNT(*) as count FROM premium_products WHERE status = "active"')
    const [serviceCount] = await db.execute('SELECT COUNT(*) as count FROM social_services WHERE status = "active"')

    const reportData = {
      totalRevenue: current.totalRevenue,
      totalOrders: current.totalOrders,
      totalCustomers: current.totalCustomers,
      totalProducts: (productCount as any[])[0].count + (serviceCount as any[])[0].count,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
      dailyRevenue: dailyRevenue.map((item) => ({
        date: format(new Date(item.date), "dd/MM"),
        revenue: item.revenue,
        orders: item.orders,
      })),
      monthlyRevenue: monthlyRevenue,
      productSales: allSales,
      ordersByStatus: ordersByStatus as any[],
      revenueByType,
      topCustomers: topCustomers as any[],
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
