"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Timer,
  Filter,
  FileSpreadsheet,
  Users,
  ShoppingCart,
  Share2,
  Zap,
  Calendar,
  DollarSign,
} from "lucide-react"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { toast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

interface OrderItem {
  product_id: number
  product_name: string
  product_slug: string
  category_name: string
  quantity: number
  unit_price: number
  total_price: number
  is_flash_sale: boolean
  flash_sale_discount_percent: number
  original_price: number | null
  savings_amount: number
  account_email?: string
  account_password?: string
  service_type?: string
  target_url?: string
  whatsapp_number?: string
  indosmm_order_id?: string
  start_count?: number
  remains?: number
}

interface Order {
  id: number
  order_number: string
  type: string
  total_amount: number
  status: string
  display_status: string
  payment_method: string
  payment_status: string
  xendit_invoice_url: string
  expires_at: string
  minutes_until_expiry: number
  auto_cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_role: string
  items: OrderItem[]
}

interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  pending_revenue: number
  completed_orders: number
  completed_revenue: number
  cancelled_orders: number
  expired_orders: number
  premium_account: {
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
    cancelled_orders: number
    expired_orders: number
  }
  social_media: {
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
    cancelled_orders: number
  }
  indosmm: {
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
    cancelled_orders: number
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    fetchOrders()
    fetchStats()
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetchOrders()
      fetchStats()
    }, 120000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, typeFilter, roleFilter, dateFrom, dateTo])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/orders/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.product_name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "expired") {
        filtered = filtered.filter((order) => order.display_status === "expired")
      } else {
        filtered = filtered.filter((order) => order.status === statusFilter)
      }
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((order) => order.type === typeFilter)
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((order) => order.user_role === roleFilter)
    }

    // Date filtering
    if (dateFrom || dateTo) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null

        if (fromDate && toDate) {
          return orderDate >= fromDate && orderDate <= toDate
        } else if (fromDate) {
          return orderDate >= fromDate
        } else if (toDate) {
          return orderDate <= toDate
        }
        return true
      })
    }

    setFilteredOrders(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "premium_account":
        return <ShoppingCart className="h-4 w-4" />
      case "social_media":
        return <Share2 className="h-4 w-4" />
      case "indosmm":
        return <Zap className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getOrderTypeBadge = (type: string) => {
    switch (type) {
      case "premium_account":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      case "social_media":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            Social
          </Badge>
        )
      case "indosmm":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            IndoSMM
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        )
    }
  }
const exportToExcel = () => {
  // Hitung total statistik
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const completedRevenue = filteredOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total_amount, 0)
  const pendingRevenue = filteredOrders
    .filter((order) => order.status === "pending")
    .reduce((sum, order) => sum + order.total_amount, 0)

  // Data utama (data orders)
  const excelData = filteredOrders.map((order) => ({
    "No. Order": order.order_number,
    Tanggal: formatDate(order.created_at),
    Customer: order.user_name,
    Email: order.user_email,
    Role: order.user_role,
    Tipe:
      order.type === "premium_account"
        ? "Premium Account"
        : order.type === "social_media"
        ? "Social Media"
        : order.type === "indosmm"
        ? "IndoSMM"
        : order.type,
    Status: order.status,
    Produk: order.items.map((item) => item.product_name).join("; "),
    "Jumlah Item": order.items.length,
    Total: order.total_amount,
    "Status Pembayaran": order.payment_status,
    "Metode Pembayaran": order.payment_method,
  }))

  // Data ringkasan dalam bentuk vertikal
  const summaryData = [
    {}, // baris kosong
    { Keterangan: "RINGKASAN LAPORAN", Nilai: "" },
    { Keterangan: "Total Orders", Nilai: filteredOrders.length },
    { Keterangan: "Total Revenue", Nilai: totalRevenue },
    { Keterangan: "Completed Revenue", Nilai: completedRevenue },
    { Keterangan: "Pending Revenue", Nilai: pendingRevenue },
    { Keterangan: "Orders Completed", Nilai: filteredOrders.filter((o) => o.status === "completed").length },
    { Keterangan: "Orders Pending", Nilai: filteredOrders.filter((o) => o.status === "pending").length },
    { Keterangan: "Orders Cancelled", Nilai: filteredOrders.filter((o) => o.status === "cancelled").length },
  ]

  const finalData = [...excelData, ...summaryData]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(finalData)

  // Atur lebar kolom
  ws["!cols"] = [
    { wch: 20 }, // No. Order / Keterangan
    { wch: 20 }, // Nilai
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 40 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, "Orders Report")

  // Buat nama file
  let filename = "orders-report"
  if (dateFrom && dateTo) {
    filename += `-${dateFrom}-to-${dateTo}`
  } else if (dateFrom) {
    filename += `-from-${dateFrom}`
  } else if (dateTo) {
    filename += `-until-${dateTo}`
  } else {
    const currentMonth = new Date().toISOString().slice(0, 7)
    filename += `-${currentMonth}`
  }
  filename += ".xlsx"

  // Simpan file
  XLSX.writeFile(wb, filename)

  toast({
    title: "Export Berhasil",
    description: `Laporan telah diexport ke ${filename}`,
  })
}

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Laporan Orders</h1>
          <p className="text-gray-600">Monitor dan kelola semua pesanan</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Orders</p>
                <p className="text-xl font-bold">{stats.total_orders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.total_revenue)}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-xl font-bold text-orange-600">{stats.pending_orders}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.pending_revenue)}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed_orders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.completed_revenue)}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{stats.cancelled_orders + stats.expired_orders}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Lost Revenue</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="premium_account">Premium Account</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="indosmm">IndoSMM</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role User" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Dari tanggal"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Sampai tanggal"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {filteredOrders.length} orders
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total_amount, 0))}
              </span>
              {(dateFrom || dateTo) && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  {dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : dateFrom ? `Dari ${dateFrom}` : `Sampai ${dateTo}`}
                </span>
              )}
            </div>
            {(searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              roleFilter !== "all" ||
              dateFrom ||
              dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                  setRoleFilter("all")
                  setDateFrom("")
                  setDateTo("")
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List - Compact Cards */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={`${order.type}-${order.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Order Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{order.order_number}</h3>
                      <OrderStatusBadge
                        status={order.status}
                        displayStatus={order.display_status}
                        minutesUntilExpiry={order.minutes_until_expiry}
                      />
                      {getOrderTypeBadge(order.type)}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium truncate">{order.user_name}</span>
                      <Badge
                        variant={
                          order.user_role === "admin"
                            ? "default"
                            : order.user_role === "reseller"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {order.user_role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.user_email}</p>
                  </div>

                  {/* Items Summary */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium mb-1">{order.items.length} item(s)</p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items.map((item) => item.product_name).join(", ")}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-gray-500">{order.payment_status}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {order.status === "pending" && order.xendit_invoice_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={order.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Expiry Warning */}
              {order.status === "pending" && order.minutes_until_expiry > 0 && order.minutes_until_expiry <= 30 && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <Timer className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-800">Expires in {order.minutes_until_expiry} minutes!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Orders</h3>
            <p className="text-gray-500">
              {searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              roleFilter !== "all" ||
              dateFrom ||
              dateTo
                ? "Tidak ada orders yang sesuai dengan filter."
                : "Belum ada orders yang masuk."}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detail Order</h2>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Number</label>
                      <p className="font-mono text-lg">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <OrderStatusBadge
                          status={selectedOrder.status}
                          displayStatus={selectedOrder.display_status}
                          minutesUntilExpiry={selectedOrder.minutes_until_expiry}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <div className="mt-1">{getOrderTypeBadge(selectedOrder.type)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Status</label>
                      <Badge
                        variant={
                          selectedOrder.payment_status === "paid"
                            ? "default"
                            : selectedOrder.payment_status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {selectedOrder.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer</label>
                      <p className="font-medium">{selectedOrder.user_name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
                      <Badge
                        variant={
                          selectedOrder.user_role === "admin"
                            ? "default"
                            : selectedOrder.user_role === "reseller"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {selectedOrder.user_role}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p>{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedOrder.total_amount)}</p>
                    </div>
                    {selectedOrder.expires_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Expires At</label>
                        <p>{formatDate(selectedOrder.expires_at)}</p>
                        {selectedOrder.minutes_until_expiry > 0 && (
                          <p className="text-sm text-orange-600">
                            {selectedOrder.minutes_until_expiry} minutes remaining
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-3 block">Order Items</label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">{item.category_name}</p>
                            <p className="text-sm">Quantity: {item.quantity}</p>
                            <p className="text-sm">Unit Price: {formatCurrency(item.unit_price)}</p>
                            {item.is_flash_sale && (
                              <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                Flash Sale -{item.flash_sale_discount_percent}%
                              </Badge>
                            )}
                            {/* Social Media specific fields */}
                            {selectedOrder.type === "social_media" && (
                              <div className="mt-2 space-y-1 text-sm">
                                {item.service_type && (
                                  <p>
                                    <span className="font-medium">Service Type:</span> {item.service_type}
                                  </p>
                                )}
                                {item.target_url && (
                                  <p>
                                    <span className="font-medium">Target URL:</span> {item.target_url}
                                  </p>
                                )}
                                {item.whatsapp_number && (
                                  <p>
                                    <span className="font-medium">WhatsApp:</span> {item.whatsapp_number}
                                  </p>
                                )}
                              </div>
                            )}
                            {/* IndoSMM specific fields */}
                            {selectedOrder.type === "indosmm" && (
                              <div className="mt-2 space-y-1 text-sm">
                                {item.indosmm_order_id && (
                                  <p>
                                    <span className="font-medium">IndoSMM Order ID:</span> {item.indosmm_order_id}
                                  </p>
                                )}
                                {item.target_url && (
                                  <p>
                                    <span className="font-medium">Target URL:</span> {item.target_url}
                                  </p>
                                )}
                                {item.start_count !== undefined && (
                                  <p>
                                    <span className="font-medium">Start Count:</span> {item.start_count}
                                  </p>
                                )}
                                {item.remains !== undefined && (
                                  <p>
                                    <span className="font-medium">Remains:</span> {item.remains}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                            {item.original_price && item.original_price > item.unit_price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.original_price * item.quantity)}
                              </p>
                            )}
                            {item.savings_amount > 0 && (
                              <p className="text-sm text-green-600">Saved: {formatCurrency(item.savings_amount)}</p>
                            )}
                          </div>
                        </div>

                        {/* Account Details for Completed Premium Account Orders */}
                        {selectedOrder.status === "completed" &&
                          selectedOrder.type === "premium_account" &&
                          item.account_email && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                              <h5 className="font-medium text-green-800 mb-2">Account Details</h5>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">Email:</span> {item.account_email}
                                </div>
                                <div>
                                  <span className="font-medium">Password:</span> {item.account_password}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.xendit_invoice_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Payment Information</label>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Xendit Invoice</p>
                          <p className="text-sm text-gray-600">Payment Method: {selectedOrder.payment_method}</p>
                          <p className="text-sm text-gray-600">Status: {selectedOrder.payment_status}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a href={selectedOrder.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Invoice
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {selectedOrder.status === "cancelled" && selectedOrder.cancellation_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Cancellation Information</label>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Reason:</strong> {selectedOrder.cancellation_reason}
                      </p>
                      {selectedOrder.auto_cancelled_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Auto-cancelled at {formatDate(selectedOrder.auto_cancelled_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
