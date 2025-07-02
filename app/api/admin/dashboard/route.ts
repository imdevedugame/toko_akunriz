import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total products
    const [productRows] = await db.execute('SELECT COUNT(*) as count FROM premium_products WHERE status = "active"')
    const totalProducts = (productRows as any[])[0].count

    // Get total users
    const [userRows] = await db.execute("SELECT COUNT(*) as count FROM users")
    const totalUsers = (userRows as any[])[0].count

    // Get total orders
    const [orderRows] = await db.execute("SELECT COUNT(*) as count FROM orders")
    const totalOrders = (orderRows as any[])[0].count

    // Get total revenue
    const [revenueRows] = await db.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = "completed"',
    )
    const totalRevenue = (revenueRows as any[])[0].total

    // Get pending orders
    const [pendingRows] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "pending"')
    const pendingOrders = (pendingRows as any[])[0].count

    // Get active services
    const [serviceRows] = await db.execute('SELECT COUNT(*) as count FROM indosmm_services WHERE status = "active"')
    const activeServices = (serviceRows as any[])[0].count

    return NextResponse.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        activeServices,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
