"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  orderGrowth: number
  customerGrowth: number
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>
  productSales: Array<{ name: string; sales: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>
  revenueByType: Array<{ type: string; revenue: number; percentage: number }>
  topCustomers: Array<{ name: string; email: string; totalSpent: number; orderCount: number }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<string>("thisMonth")
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()))
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()))

  useEffect(() => {
    updateDateRange(dateRange)
  }, [dateRange])

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchReportData()
    }
  }, [dateFrom, dateTo])

  const updateDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case "today":
        setDateFrom(now)
        setDateTo(now)
        break
      case "yesterday":
        const yesterday = subDays(now, 1)
        setDateFrom(yesterday)
        setDateTo(yesterday)
        break
      case "last7days":
        setDateFrom(subDays(now, 7))
        setDateTo(now)
        break
      case "last30days":
        setDateFrom(subDays(now, 30))
        setDateTo(now)
        break
      case "thisMonth":
        setDateFrom(startOfMonth(now))
        setDateTo(endOfMonth(now))
        break
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        setDateFrom(startOfMonth(lastMonth))
        setDateTo(endOfMonth(lastMonth))
        break
      case "thisYear":
        setDateFrom(startOfYear(now))
        setDateTo(endOfYear(now))
        break
      case "custom":
        // Keep current dates
        break
    }
  }

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/reports?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const exportReport = () => {
    if (!reportData) return

    const reportContent = `
LAPORAN PENDAPATAN
Periode: ${format(dateFrom, "dd MMMM yyyy", { locale: id })} - ${format(dateTo, "dd MMMM yyyy", { locale: id })}

RINGKASAN:
- Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}
- Total Pesanan: ${reportData.totalOrders}
- Total Pelanggan: ${reportData.totalCustomers}
- Pertumbuhan Pendapatan: ${reportData.revenueGrowth.toFixed(1)}%

PENDAPATAN HARIAN:
${reportData.dailyRevenue.map((item) => `${item.date}: ${formatCurrency(item.revenue)} (${item.orders} pesanan)`).join("\n")}

PRODUK TERLARIS:
${reportData.productSales.map((item) => `${item.name}: ${item.sales} terjual, ${formatCurrency(item.revenue)}`).join("\n")}
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan-${format(dateFrom, "yyyy-MM-dd")}-${format(dateTo, "yyyy-MM-dd")}.txt`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Laporan & Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Laporan & Analytics</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p>Gagal memuat data laporan. Silakan coba lagi.</p>
            <Button onClick={fetchReportData} className="mt-4">
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Laporan & Analytics</h1>
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="yesterday">Kemarin</SelectItem>
                <SelectItem value="last7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="last30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                <SelectItem value="thisYear">Tahun Ini</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Dari Tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "Sampai Tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </>
            )}

            <div className="text-sm text-gray-500">
              {format(dateFrom, "dd MMM yyyy", { locale: id })} - {format(dateTo, "dd MMM yyyy", { locale: id })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={reportData.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(reportData.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">dari periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.orderGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={reportData.orderGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(reportData.orderGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">dari periode sebelumnya</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.customerGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={reportData.customerGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(reportData.customerGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">pelanggan baru</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Pesanan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.totalOrders > 0 ? reportData.totalRevenue / reportData.totalOrders : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Nilai rata-rata pesanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pesanan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value, "Pesanan"]}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.productSales.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => [value, "Terjual"]} />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.revenueByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {reportData.revenueByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Pelanggan Teratas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topCustomers.slice(0, 10).map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(customer.totalSpent)}</div>
                  <div className="text-sm text-gray-500">{customer.orderCount} pesanan</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
