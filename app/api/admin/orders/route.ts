import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "") || 1
    const limit = Number.parseInt(searchParams.get("limit") || "") || 50
    const offset = (page - 1) * limit

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""
    const userRole = searchParams.get("user_role") || ""

    // Build WHERE clause for premium account orders
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += `
        AND (
          o.order_number LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
        )`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (status) {
      if (status === "expired") {
        whereClause += " AND (o.expires_at IS NOT NULL AND o.expires_at <= NOW() AND o.status = 'pending')"
      } else {
        whereClause += " AND o.status = ?"
        params.push(status)
      }
    }

    if (userRole) {
      whereClause += " AND u.role = ?"
      params.push(userRole)
    }

    // Fetch premium account orders
   let premiumOrders: any[] = []

if (type === "all" || type === "premium_account" || !type) {
  const premiumSql = `
    SELECT 
  o.id,
  o.order_number,
  'premium_account' as type,
  o.total_amount,
  o.status,
  CASE 
    WHEN o.status = 'pending' AND o.expires_at IS NOT NULL AND o.expires_at <= NOW() THEN 'expired'
    ELSE o.status
  END as display_status,
  o.payment_method,
  o.payment_status,
  o.xendit_invoice_url,
  o.expires_at,
  CASE 
    WHEN o.expires_at IS NULL THEN NULL
    WHEN o.expires_at <= NOW() THEN 0
    ELSE TIMESTAMPDIFF(MINUTE, NOW(), o.expires_at)
  END as minutes_until_expiry,
  o.auto_cancelled_at,
  o.cancellation_reason,
  o.created_at,
  o.updated_at,
  u.name as user_name,
  u.email as user_email,
  u.role as user_role
FROM orders o
JOIN users u ON o.user_id = u.id
${whereClause}
ORDER BY o.created_at DESC
LIMIT ${limit} OFFSET ${offset}

  `

  const [premiumRows] = await db.execute(premiumSql, params)

  premiumOrders = (premiumRows as any[]).map(order => ({
  ...order,
  items: order.items ? JSON.parse(order.items) : []
}))

}


    // Fetch social media orders
    let socialOrders: any[] = []
    if (type === "all" || type === "social_media" || !type) {
      // Build WHERE clause for social orders
      let socialWhereClause = "WHERE 1=1"
      const socialParams: any[] = []

      if (search) {
        socialWhereClause += `
          AND (
            so.order_number LIKE ?
            OR u.name LIKE ?
            OR u.email LIKE ?
            OR so.whatsapp_number LIKE ?
            OR ss.name LIKE ?
          )`
        const searchPattern = `%${search}%`
        socialParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
      }

      if (status && status !== "expired") {
        socialWhereClause += " AND so.status = ?"
        socialParams.push(status)
      }

      if (userRole) {
        socialWhereClause += " AND u.role = ?"
        socialParams.push(userRole)
      }

      const socialSql = `
        SELECT 
          so.id,
          so.order_number,
          'social_media' as type,
          so.total_amount,
          so.status,
          so.status as display_status,
          so.payment_method,
          so.payment_status,
          so.xendit_invoice_url,
          NULL as expires_at,
          NULL as minutes_until_expiry,
          NULL as auto_cancelled_at,
          NULL as cancellation_reason,
          so.created_at,
          so.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role,
          JSON_ARRAY(
            JSON_OBJECT(
              'product_id', so.service_id,
              'product_name', ss.name,
              'product_slug', LOWER(REPLACE(ss.name, ' ', '-')),
              'category_name', sc.name,
              'quantity', so.quantity,
              'unit_price', ss.price,
              'total_price', so.total_amount,
              'is_flash_sale', false,
              'flash_sale_discount_percent', 0,
              'original_price', NULL,
              'savings_amount', 0,
              'service_type', ss.service_type,
              'target_url', so.target_url,
              'whatsapp_number', so.whatsapp_number
            )
          ) as items
        FROM social_orders so
        JOIN users u ON so.user_id = u.id
        JOIN social_services ss ON so.service_id = ss.id
        JOIN social_categories sc ON ss.category_id = sc.id
        ${socialWhereClause}
        ORDER BY so.created_at DESC
        LIMIT ${Math.max(0, limit - premiumOrders.length)} OFFSET ${offset}`

      if (limit - premiumOrders.length > 0) {
        const [socialRows] = await db.execute(socialSql, socialParams)
        socialOrders = (socialRows as any[]).map((order) => ({
          ...order,
          items: JSON.parse(order.items),
        }))
      }
    }

    // // Fetch IndoSMM orders
    // let indosmmOrders: any[] = []
    // if (type === "all" || type === "indosmm" || !type) {
    //   // Build WHERE clause for indosmm orders
    //   let indosmmWhereClause = "WHERE 1=1"
    //   const indosmmParams: any[] = []

    //   if (search) {
    //     indosmmWhereClause += `
    //       AND (
    //         io.order_number LIKE ?
    //         OR u.name LIKE ?
    //         OR u.email LIKE ?
    //         OR io.service_name LIKE ?
    //       )`
    //     const searchPattern = `%${search}%`
    //     indosmmParams.push(searchPattern, searchPattern, searchPattern, searchPattern)
    //   }

    //   if (status && status !== "expired") {
    //     indosmmWhereClause += " AND io.status = ?"
    //     indosmmParams.push(status)
    //   }

    //   if (userRole) {
    //     indosmmWhereClause += " AND u.role = ?"
    //     indosmmParams.push(userRole)
    //   }

    //   const indosmmSql = `
    //     SELECT 
    //       io.id,
    //       io.order_number,
    //       'indosmm' as type,
    //       io.total_amount,
    //       io.status,
    //       io.status as display_status,
    //       io.payment_method,
    //       io.payment_status,
    //       io.xendit_invoice_url,
    //       NULL as expires_at,
    //       NULL as minutes_until_expiry,
    //       NULL as auto_cancelled_at,
    //       NULL as cancellation_reason,
    //       io.created_at,
    //       io.updated_at,
    //       u.name as user_name,
    //       u.email as user_email,
    //       u.role as user_role,
    //       JSON_ARRAY(
    //         JSON_OBJECT(
    //           'product_id', io.service_id,
    //           'product_name', io.service_name,
    //           'product_slug', LOWER(REPLACE(io.service_name, ' ', '-')),
    //           'category_name', 'IndoSMM Service',
    //           'quantity', io.quantity,
    //           'unit_price', io.price_per_unit,
    //           'total_price', io.total_amount,
    //           'is_flash_sale', false,
    //           'flash_sale_discount_percent', 0,
    //           'original_price', NULL,
    //           'savings_amount', 0,
    //           'target_url', io.target_url,
    //           'indosmm_order_id', io.indosmm_order_id,
    //           'start_count', io.start_count,
    //           'remains', io.remains
    //         )
    //       ) as items
    //     FROM indosmm_orders io
    //     JOIN users u ON io.user_id = u.id
    //     ${indosmmWhereClause}
    //     ORDER BY io.created_at DESC
    //     LIMIT ${Math.max(0, limit - premiumOrders.length - socialOrders.length)} OFFSET ${offset}`

    //   if (limit - premiumOrders.length - socialOrders.length > 0) {
    //     const [indosmmRows] = await db.execute(indosmmSql, indosmmParams)
    //     indosmmOrders = (indosmmRows as any[]).map((order) => ({
    //       ...order,
    //       items: JSON.parse(order.items),
    //     }))
    //   }
    // }

    // Combine all orders and sort by created_at
    const allOrders = [...premiumOrders, ...socialOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return NextResponse.json({
      orders: allOrders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(allOrders.length / limit),
        totalCount: allOrders.length,
      },
    })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
