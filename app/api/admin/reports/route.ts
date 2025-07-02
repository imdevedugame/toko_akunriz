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

    // Current period stats
    const [currentStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Previous period stats for growth calculation
    const [prevStats] = await db.execute(
      `
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(DISTINCT user_id) as totalCustomers
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'
    `,
      [startOfDay(prevFromDate).toISOString(), endOfDay(prevToDate).toISOString()],
    )

    const current = (currentStats as any[])[0]
    const previous = (prevStats as any[])[0]

    // Calculate growth percentages
    const revenueGrowth =
      previous.totalRevenue > 0 ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0
    const orderGrowth =
      previous.totalOrders > 0 ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 : 0
    const customerGrowth =
      previous.totalCustomers > 0
        ? ((current.totalCustomers - previous.totalCustomers) / previous.totalCustomers) * 100
        : 0

    // Daily revenue data
    const [dailyRevenue] = await db.execute(
      `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Monthly revenue data (if date range is more than 60 days)
    const [monthlyRevenue] = await db.execute(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Product sales data
    const [productSales] = await db.execute(
      `
      SELECT 
        p.name,
        COUNT(oi.id) as sales,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM premium_products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ? AND o.status != 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sales DESC
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Orders by status
    const [ordersByStatus] = await db.execute(
      `
      SELECT 
        status,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?)) as percentage
      FROM orders 
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
    const [revenueByType] = await db.execute(
      `
      SELECT 
        type,
        COALESCE(SUM(total_amount), 0) as revenue,
        (COALESCE(SUM(total_amount), 0) * 100.0 / (SELECT COALESCE(SUM(total_amount), 1) FROM orders WHERE created_at BETWEEN ? AND ? AND status != 'cancelled')) as percentage
      FROM orders 
      WHERE created_at BETWEEN ? AND ? AND status != 'cancelled'
      GROUP BY type
      ORDER BY revenue DESC
    `,
      [
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
        startOfDay(fromDate).toISOString(),
        endOfDay(toDate).toISOString(),
      ],
    )

    // Top customers
    const [topCustomers] = await db.execute(
      `
      SELECT 
        u.name,
        u.email,
        COALESCE(SUM(o.total_amount), 0) as totalSpent,
        COUNT(o.id) as orderCount
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.created_at BETWEEN ? AND ? AND o.status != 'cancelled'
      GROUP BY u.id, u.name, u.email
      ORDER BY totalSpent DESC
      LIMIT 20
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Get total products count
    const [productCount] = await db.execute('SELECT COUNT(*) as count FROM premium_products WHERE status = "active"')

    const reportData = {
      totalRevenue: current.totalRevenue,
      totalOrders: current.totalOrders,
      totalCustomers: current.totalCustomers,
      totalProducts: (productCount as any[])[0].count,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
      dailyRevenue: (dailyRevenue as any[]).map((item) => ({
        date: format(new Date(item.date), "dd/MM"),
        revenue: item.revenue,
        orders: item.orders,
      })),
      monthlyRevenue: (monthlyRevenue as any[]).map((item) => ({
        month: item.month,
        revenue: item.revenue,
        orders: item.orders,
      })),
      productSales: productSales as any[],
      ordersByStatus: ordersByStatus as any[],
      revenueByType: (revenueByType as any[]).map((item) => ({
        type: item.type === "premium" ? "Premium Account" : "IndoSMM Service",
        revenue: item.revenue,
        percentage: item.percentage,
      })),
      topCustomers: topCustomers as any[],
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
