import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { id } from "date-fns/locale"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromDate = new Date(searchParams.get("from") || subDays(new Date(), 30))
    const toDate = new Date(searchParams.get("to") || new Date())
    const exportType = searchParams.get("type") || "csv"

    // Get orders data
    const [ordersData] = await db.execute(
      `
      SELECT 
        o.order_number,
        o.type,
        o.total_amount,
        o.status,
        o.payment_method,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.created_at BETWEEN ? AND ?
      ORDER BY o.created_at DESC
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    // Get social orders data
    const [socialData] = await db.execute(
      `
      SELECT 
        so.order_number,
        'social_media' as type,
        so.total_amount,
        so.status,
        so.payment_method,
        so.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM social_orders so
      JOIN users u ON so.user_id = u.id
      WHERE so.created_at BETWEEN ? AND ?
      ORDER BY so.created_at DESC
    `,
      [startOfDay(fromDate).toISOString(), endOfDay(toDate).toISOString()],
    )

    const allData = [...(ordersData as any[]), ...(socialData as any[])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    if (exportType === "json") {
      return NextResponse.json({
        period: {
          from: format(fromDate, "dd MMMM yyyy", { locale: id }),
          to: format(toDate, "dd MMMM yyyy", { locale: id }),
        },
        data: allData,
        summary: {
          totalOrders: allData.length,
          totalRevenue: allData.reduce((sum, item) => sum + Number.parseFloat(item.total_amount), 0),
        },
      })
    }

    // CSV Export
    const headers = [
      "No. Pesanan",
      "Tipe Layanan",
      "Total",
      "Status",
      "Metode Pembayaran",
      "Nama Pelanggan",
      "Email Pelanggan",
      "Tanggal Pesanan",
    ]

    const csvData = allData.map((item) => [
      item.order_number,
      item.type === "premium_account"
        ? "Premium Account"
        : item.type === "indosmm_service"
          ? "IndoSMM Service"
          : "Social Media Service",
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(item.total_amount),
      item.status,
      item.payment_method || "-",
      item.customer_name,
      item.customer_email,
      format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: id }),
    ])

    const csvContent = [
      `"LAPORAN PESANAN"`,
      `"Periode: ${format(fromDate, "dd MMMM yyyy", { locale: id })} - ${format(toDate, "dd MMMM yyyy", { locale: id })}"`,
      `"Total Pesanan: ${allData.length}"`,
      `"Total Pendapatan: ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(allData.reduce((sum, item) => sum + Number.parseFloat(item.total_amount), 0))}"`,
      "",
      headers.map((h) => `"${h}"`).join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    // Add BOM for proper UTF-8 encoding in Excel
    const csvWithBOM = "\uFEFF" + csvContent

    return new NextResponse(csvWithBOM, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-${format(fromDate, "yyyy-MM-dd")}-${format(
          toDate,
          "yyyy-MM-dd",
        )}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
