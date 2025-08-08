import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🕐 Cron job triggered: cleanup-orders")

    // Call the cleanup API
    const cleanupResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/cleanup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const cleanupData = await cleanupResponse.json()

    if (!cleanupResponse.ok) {
      throw new Error(cleanupData.error || "Cleanup failed")
    }

    console.log("✅ Cron job completed successfully:", cleanupData)

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      cleanup_result: cleanupData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
