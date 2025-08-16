"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw, Eye, CreditCard, Timer, Filter, Globe, Users, Heart, MessageCircle, UserPlus, Share2, AlertCircle } from 'lucide-react'
import { useAuth } from "@/components/auth-provider"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { OrderCancelButton } from "@/components/order-cancel-button"
import { AccountDetailsModal } from "@/components/account-details-modal"
import { toast } from "@/hooks/use-toast"

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
  can_cancel: boolean
  items: OrderItem[]
}

interface SocialOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  order_details: {
    service_name: string
    service_type: string
    category_name: string
    package_name?: string
    target_url: string
    quantity: number
    is_custom: boolean
    whatsapp_number: string
    comments?: string
  }
}

const serviceTypeIcons = {
  followers: Users,
  likes: Heart,
  comments: MessageCircle,
  views: Eye,
  subscribers: UserPlus,
  shares: Share2,
}

const statusIcons = {
  completed: CheckCircle,
  paid: CheckCircle,
  processing: Clock,
  pending: AlertCircle,
  failed: XCircle,
  cancelled: XCircle,
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [socialOrders, setSocialOrders] = useState<SocialOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [filteredSocialOrders, setFilteredSocialOrders] = useState<SocialOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Order | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
      // Refresh every minute to update expiry times
      const interval = setInterval(fetchOrders, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    filterOrders()
  }, [orders, socialOrders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      // Fetch premium account orders
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        // Filter only premium account orders for history page
        const premiumOrders = data.orders.filter((order: Order) => order.type === 'premium_account')
        setOrders(premiumOrders)
      }

      // Fetch Social Media orders
      const socialResponse = await fetch("/api/social-orders")
      if (socialResponse.ok) {
        const socialData = await socialResponse.json()
        setSocialOrders(socialData.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Gagal memuat riwayat pesanan. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    // Filter premium orders
    let filtered = orders
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setFilteredOrders(filtered)

    // Filter social orders
    let filteredSocial = socialOrders
    if (searchTerm) {
      filteredSocial = filteredSocial.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_details?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_details?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      filteredSocial = filteredSocial.filter((order) => order.status === statusFilter)
    }
    setFilteredSocialOrders(filteredSocial)
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

  const getOrdersByStatus = (status: string) => {
    if (status === "expired") {
      return orders.filter((order) => order.display_status === "expired")
    }
    return orders.filter((order) => order.status === status)
  }

  const getSocialOrdersByStatus = (status: string) => {
    return socialOrders.filter((order) => order.status === status)
  }

  const handleOrderCancelled = () => {
    fetchOrders()
    toast({
      title: "Pesanan Dibatalkan",
      description: "Pesanan Anda telah dibatalkan dan stok telah dikembalikan.",
    })
  }

  // Function to check if order can be cancelled
  const canCancelOrder = (order: Order) => {
    const canCancel =
      order.status === "pending" &&
      order.display_status !== "expired" &&
      order.minutes_until_expiry > 0 &&
      !order.auto_cancelled_at

    return canCancel
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status.toLowerCase() as keyof typeof statusIcons] || AlertCircle
    return <Icon className="h-4 w-4" />
  }

  const getServiceTypeIcon = (type: string) => {
    const Icon = serviceTypeIcons[type as keyof typeof serviceTypeIcons] || Users
    return <Icon className="h-4 w-4" />
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
          <p className="text-gray-500">Silakan login untuk melihat riwayat pesanan Anda.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
            Login
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
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
          <h1 className="text-3xl font-bold mb-2">Riwayat Pesanan</h1>
          <p className="text-gray-600">Lacak dan kelola semua pesanan Anda</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari pesanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="premium" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="premium" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Akun Premium ({orders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Social Media ({socialOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Premium Accounts Tab */}
        <TabsContent value="premium">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold">{getOrdersByStatus("pending").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Kedaluwarsa</p>
                    <p className="text-2xl font-bold">{getOrdersByStatus("expired").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Selesai</p>
                    <p className="text-2xl font-bold">{getOrdersByStatus("completed").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Dibatalkan</p>
                    <p className="text-2xl font-bold">{getOrdersByStatus("cancelled").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white hover:bg-gray-50">
                    <SelectValue placeholder="Filter berdasarkan status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Semua Pesanan</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="expired">Kedaluwarsa</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Order Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.order_number}</h3>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <OrderStatusBadge
                          status={order.status}
                          displayStatus={order.display_status}
                          minutesUntilExpiry={order.minutes_until_expiry}
                        />
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.product_name}</h4>
                                {item.is_flash_sale && (
                                  <Badge className="bg-red-100 text-red-800 text-xs">
                                    Flash Sale -{item.flash_sale_discount_percent}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.category_name} • Qty: {item.quantity}
                              </p>
                              {item.savings_amount > 0 && (
                                <p className="text-sm text-green-600">Hemat: {formatCurrency(item.savings_amount)}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                              {item.original_price && item.original_price > item.unit_price && (
                                <p className="text-sm text-gray-500 line-through">
                                  {formatCurrency(item.original_price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="font-semibold">Total Pembayaran:</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
                      </div>

                      {/* Expiry Warning */}
                      {order.status === "pending" && order.minutes_until_expiry > 0 && order.minutes_until_expiry <= 30 && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              ⚠️ Pesanan akan kedaluwarsa dalam {order.minutes_until_expiry} menit! Selesaikan pembayaran sekarang atau batalkan untuk melepaskan stok.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Account Available Info */}
                      {order.status === "completed" && order.items.some(item => item.account_email) && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-green-800 flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Akun Tersedia</span>
                              </div>
                              <div className="text-sm text-green-600 mt-1">
                                Klik "Lihat Detail" untuk melihat informasi akun
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setSelectedAccount(order)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Cancellation Info */}
                      {order.status === "cancelled" && order.cancellation_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Dibatalkan:</strong> {order.cancellation_reason}
                          </p>
                          {order.auto_cancelled_at && (
                            <p className="text-xs text-red-600 mt-1">
                              Otomatis dibatalkan pada {formatDate(order.auto_cancelled_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {/* Pay Now Button */}
                      {order.status === "pending" && order.xendit_invoice_url && order.minutes_until_expiry > 0 && (
                        <Button asChild className="w-full">
                          <a href={order.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Bayar Sekarang
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      )}

                      {/* Cancel Button */}
                      {canCancelOrder(order) && (
                        <OrderCancelButton
                          orderNumber={order.order_number}
                          onCancelled={handleOrderCancelled}
                          className="w-full"
                        />
                      )}

                      {/* View Details Button */}
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="w-full bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Detail
                      </Button>

                      {/* Status Info */}
                      {order.status === "pending" && order.minutes_until_expiry <= 0 && (
                        <p className="text-xs text-orange-600 text-center">Pesanan kedaluwarsa - akan dibatalkan otomatis</p>
                      )}
                      {order.status === "completed" && (
                        <p className="text-xs text-green-600 text-center">✅ Pesanan selesai berhasil</p>
                      )}
                      {order.status === "cancelled" && (
                        <p className="text-xs text-red-600 text-center">❌ Pesanan dibatalkan</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Pesanan</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Tidak ada pesanan yang sesuai dengan filter Anda."
                    : "Anda belum melakukan pesanan apapun."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button className="mt-4" onClick={() => (window.location.href = "/products")}>
                    Mulai Belanja
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          {/* Stats Cards for Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold">{getSocialOrdersByStatus("pending").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Diproses</p>
                    <p className="text-2xl font-bold">{getSocialOrdersByStatus("processing").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Selesai</p>
                    <p className="text-2xl font-bold">{getSocialOrdersByStatus("completed").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Dibatalkan</p>
                    <p className="text-2xl font-bold">{getSocialOrdersByStatus("cancelled").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {filteredSocialOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          {getServiceTypeIcon(order.order_details?.service_type)}
                          <h3 className="font-semibold text-lg">{order.order_details?.service_name}</h3>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                          <Badge className={getStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                          <Badge variant="outline">{order.order_details?.category_name}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-gray-600">Order ID:</span>
                          <div className="font-mono text-gray-900">{order.order_number}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Type:</span>
                          <div>
                            <Badge variant={order.order_details?.is_custom ? "outline" : "default"}>
                              {order.order_details?.is_custom ? "Custom" : "Package"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Quantity:</span>
                          <div className="text-gray-900">{order.order_details?.quantity?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Total:</span>
                          <div className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</div>
                        </div>
                      </div>

                      {order.order_details?.package_name && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="font-medium text-blue-700">Package:</span>{" "}
                          <span className="text-blue-800">{order.order_details.package_name}</span>
                        </div>
                      )}

                      <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className="font-medium text-gray-700">Target:</span>
                        <div className="break-all text-gray-800 mt-1">{order.order_details?.target_url}</div>
                      </div>

                      {order.order_details?.comments && (
                        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <span className="font-medium text-gray-700">Comments:</span>
                          <div className="italic text-gray-800 mt-1">{order.order_details.comments}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Tanggal:</span>{" "}
                            {new Date(order.created_at).toLocaleDateString("id-ID")}
                          </div>
                          <div>
                            <span className="font-medium">WhatsApp:</span> {order.order_details?.whatsapp_number}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(order.order_details.target_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Buka Target
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSocialOrders.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada order Social Media</h3>
                <p className="text-gray-500">Mulai tingkatkan media sosial Anda dengan layanan kami.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detail Pesanan</h2>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nomor Pesanan</label>
                    <p className="font-mono">{selectedOrder.order_number}</p>
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
                    <label className="text-sm font-medium text-gray-600">Dibuat</label>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Pembayaran</label>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedOrder.total_amount)}</p>
                  </div>
                </div>

                {/* Cancel Button in Modal */}
                {canCancelOrder(selectedOrder) && (
                  <div className="flex justify-center">
                    <OrderCancelButton
                      orderNumber={selectedOrder.order_number}
                      onCancelled={() => {
                        handleOrderCancelled()
                        setSelectedOrder(null)
                      }}
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                {/* Items */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-3 block">Item Pesanan</label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">{item.category_name}</p>
                            <p className="text-sm">Jumlah: {item.quantity}</p>
                            {item.is_flash_sale && (
                              <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                Flash Sale -{item.flash_sale_discount_percent}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                            {item.original_price && item.original_price > item.unit_price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.original_price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Account Details for Completed Orders */}
                        {selectedOrder.status === "completed" && item.account_email && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                            <h5 className="font-medium text-green-800 mb-2">Detail Akun</h5>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <AccountDetailsModal
          order={selectedAccount}
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  )
}
