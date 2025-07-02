import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { indoSMMService } from "@/lib/indosmm"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = `
      SELECT * FROM indosmm_services 
      WHERE status = 'active'
    `
    const params: any[] = []

    // Filter berdasarkan kategori spesifik jika dipilih
    if (category && category !== "all") {
      query += " AND category = ?"
      params.push(category)
    }

    // Filter berdasarkan pencarian
    if (search) {
      query += " AND (name LIKE ? OR category LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    // Get total count untuk pagination
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total")
    const countParams = [...params]
    const [countRows] = await db.execute(countQuery, countParams)
    const total = (countRows as any[])[0]?.total || 0

    // Get paginated results
    query += ` ORDER BY category ASC, name ASC LIMIT ${limit} OFFSET ${offset}`
    const paginatedParams = [...params]

    const [rows] = await db.execute(query, paginatedParams)

    // Get unique categories dari hasil yang difilter
    const [categoryRows] = await db.execute(
      `SELECT DISTINCT category FROM indosmm_services 
       WHERE status = 'active'
       ORDER BY category ASC`
    )

    return NextResponse.json({
      services: rows,
      categories: (categoryRows as any[]).map((row) => row.category),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Starting IndoSMM services sync...")

    // Test connection first
    const isConnected = await indoSMMService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        {
          error: "Cannot connect to IndoSMM API and not in development mode.",
        },
        { status: 400 },
      )
    }

    // Get services from IndoSMM API
    let services
    try {
      services = await indoSMMService.getServices()
      console.log(`📋 Retrieved ${services.length} services from IndoSMM API`)
    } catch (error) {
      console.error("IndoSMM API Error:", error)
      return NextResponse.json(
        {
          error: `IndoSMM API Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 400 },
      )
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        {
          error: "No services returned from IndoSMM API",
        },
        { status: 400 },
      )
    }

    // Tidak ada filter kategori, semua layanan akan diproses
    const filteredServices = services

    console.log(`🔍 Processing ${filteredServices.length} services`)

    let syncedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const service of filteredServices) {
      try {
        // Validate service data
        if (!service.service || !service.name || !service.rate) {
          console.warn("⚠️ Skipping invalid service:", service)
          errorCount++
          continue
        }

        // Check if service exists
        const [existingRows] = await db.execute("SELECT id FROM indosmm_services WHERE service_id = ?", [
          service.service,
        ])

        const baseRate = Number.parseFloat(service.rate) || 0
        const userRate = baseRate * 1.2 // 20% markup for users
        const resellerRate = baseRate * 1.1 // 10% markup for resellers

        // Auto-assign image based on category
        const getServiceImage = (category: string) => {
          const categoryLower = category.toLowerCase()
          if (categoryLower.includes("instagram")) return "/images/services/instagram.png"
          if (categoryLower.includes("facebook")) return "/images/services/facebook.png"
          if (categoryLower.includes("twitter") || categoryLower.includes("x ")) return "/images/services/twitter.png"
          if (categoryLower.includes("youtube")) return "/images/services/youtube.png"
          if (categoryLower.includes("tiktok")) return "/images/services/tiktok.png"
          if (categoryLower.includes("linkedin")) return "/images/services/linkedin.png"
          if (categoryLower.includes("telegram")) return "/images/services/telegram.png"
          if (categoryLower.includes("whatsapp")) return "/images/services/whatsapp.png"
          if (categoryLower.includes("spotify")) return "/images/services/spotify.png"
          if (categoryLower.includes("soundcloud")) return "/images/services/soundcloud.png"
          if (categoryLower.includes("website") || categoryLower.includes("traffic"))
            return "/images/services/website.png"
          if (categoryLower.includes("seo")) return "/images/services/seo.png"
          return "/images/services/website.png" // default
        }

        const imageUrl = getServiceImage(service.category || "")

        if ((existingRows as any[]).length === 0) {
          // Insert new service
          await db.execute(
            `INSERT INTO indosmm_services 
             (service_id, name, category, rate, min_order, max_order, user_rate, reseller_rate, image_url, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
              service.service,
              service.name,
              service.category || "Other",
              baseRate,
              Number.parseInt(service.min) || 1,
              Number.parseInt(service.max) || 10000,
              userRate,
              resellerRate,
              imageUrl,
            ],
          )
          syncedCount++
        } else {
          // Update existing service
          await db.execute(
            `UPDATE indosmm_services 
             SET name = ?, category = ?, rate = ?, min_order = ?, max_order = ?, 
                 user_rate = ?, reseller_rate = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
             WHERE service_id = ?`,
            [
              service.name,
              service.category || "Other",
              baseRate,
              Number.parseInt(service.min) || 1,
              Number.parseInt(service.max) || 10000,
              userRate,
              resellerRate,
              imageUrl,
              service.service,
            ],
          )
          updatedCount++
        }
      } catch (serviceError) {
        console.error(`❌ Error processing service ${service.service}:`, serviceError)
        errorCount++
      }
    }

    console.log(`✅ Sync completed: ${syncedCount} new, ${updatedCount} updated, ${errorCount} errors`)

    return NextResponse.json({
      message: "Services synced successfully",
      synced: syncedCount,
      updated: updatedCount,
      errors: errorCount,
      total: filteredServices.length,
      usingMockData: !process.env.INDOSMM_API_KEY || process.env.INDOSMM_API_KEY === "your-indosmm-api-key",
    })
  } catch (error) {
    console.error("Sync services error:", error)
    return NextResponse.json(
      {
        error: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
