"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Package,
  TrendingUp,
  Eye,
  ExternalLink,
  Calendar,
  DollarSign,
  Hash,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Copy,
  Filter,
  Download,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AccountDetailsModal } from "@/components/account-details-modal"
import { IndoSMMOrderModal } from "@/components/indosmm-order-modal"

interface PremiumOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
  order_details: {
    product_name: string
    account_email: string
    account_password: string
  }
}

interface IndoSMMOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
  order_details: {
    service_name: string
    target: string
    quantity: number
    indosmm_order_id: number
    indosmm_status: string
  }
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [premiumOrders, setPremiumOrders] = useState<PremiumOrder[]>([])
  const [indosmmOrders, setIndosmmOrders] = useState<IndoSMMOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<PremiumOrder | null>(null)
  const [selectedIndoSMMOrder, setSelectedIndoSMMOrder] = useState<IndoSMMOrder | null>(null)
  const [activeTab, setActiveTab] = useState("premium")

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      // Fetch premium account orders
      const premiumResponse = await fetch("/api/orders?type=premium_account")
      if (premiumResponse.ok) {
        const premiumData = await premiumResponse.json()
        setPremiumOrders(premiumData.orders)
      }

      // Fetch IndoSMM orders
      const indosmmResponse = await fetch("/api/orders?type=indosmm_service")
      if (indosmmResponse.ok) {
        const indosmmData = await indosmmResponse.json()
        setIndosmmOrders(indosmmData.orders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return {
          variant: "default" as const,
          color: "bg-green-500",
          icon: CheckCircle,
          text: "Selesai",
        }
      case "processing":
        return {
          variant: "secondary" as const,
          color: "bg-blue-500",
          icon: RefreshCw,
          text: "Diproses",
        }
      case "pending":
        return {
          variant: "outline" as const,
          color: "bg-yellow-500",
          icon: Clock,
          text: "Menunggu",
        }
      case "failed":
      case "cancelled":
        return {
          variant: "destructive" as const,
          color: "bg-red-500",
          icon: XCircle,
          text: "Gagal",
        }
      default:
        return {
          variant: "outline" as const,
          color: "bg-gray-500",
          icon: AlertCircle,
          text: status,
        }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Disalin ke clipboard!")
  }

  const filteredPremiumOrders = premiumOrders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredIndoSMMOrders = indosmmOrders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.target?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Login Diperlukan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Silakan login terlebih dahulu untuk melihat riwayat pembelian dan pesanan Anda.
            </p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Login Sekarang
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 bg-amber-200" />
              <Skeleton className="h-4 w-96 bg-orange-200" />
            </div>
            <Skeleton className="h-10 w-80 bg-amber-200" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-md bg-white/80">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3 bg-amber-200" />
                      <Skeleton className="h-4 w-1/2 bg-orange-200" />
                      <Skeleton className="h-4 w-1/4 bg-amber-200" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Riwayat Pembelian
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Kelola dan lihat semua pembelian Anda</p>
            </div>
          </div>

          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">{premiumOrders.length}</div>
                <div className="text-xs text-gray-600">Akun Premium</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">{indosmmOrders.length}</div>
                <div className="text-xs text-gray-600">Layanan SMM</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {[...premiumOrders, ...indosmmOrders].filter((o) => o.status === "completed").length}
                </div>
                <div className="text-xs text-gray-600">Selesai</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    [...premiumOrders, ...indosmmOrders].reduce((sum, order) => sum + order.total_amount, 0),
                  )}
                </div>
                <div className="text-xs text-gray-600">Total Belanja</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Search */}
        <Card className="mb-6 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan order ID, produk, atau target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-200 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="premium" className="flex items-center space-x-2 text-xs sm:text-sm">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Akun Premium</span>
                  <span className="sm:hidden">Premium</span>
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 ml-1">{premiumOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="indosmm" className="flex items-center space-x-2 text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Layanan SMM</span>
                  <span className="sm:hidden">SMM</span>
                  <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 ml-1">{indosmmOrders.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Premium Accounts Tab - Mobile Optimized */}
          <TabsContent value="premium">
            <div className="space-y-4">
              {filteredPremiumOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                return (
                  <Card key={order.id} className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      {/* Mobile Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                            {order.order_details?.product_name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`${statusConfig.color} text-white text-xs px-2 py-1 flex items-center gap-1`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.text}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Details Grid */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Hash className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Order ID</div>
                            <div className="font-mono text-sm truncate">{order.order_number}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(order.order_number)}
                            className="p-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Tanggal Pembelian</div>
                            <div className="text-sm font-medium">
                              {new Date(order.created_at).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Available Section */}
                      {order.status === "completed" && order.order_details?.account_email && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-green-800">Akun Siap Digunakan</div>
                              <div className="text-sm text-green-600">
                                Akun premium Anda sudah tersedia dan siap digunakan
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedAccount(order)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail Akun
                          </Button>
                        </div>
                      )}

                      {/* Processing Status */}
                      {order.status === "processing" && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <RefreshCw className="h-4 w-4 text-white animate-spin" />
                            </div>
                            <div>
                              <div className="font-bold text-blue-800">Sedang Diproses</div>
                              <div className="text-sm text-blue-600">
                                Pesanan Anda sedang diproses, mohon tunggu sebentar
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {filteredPremiumOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Package className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Belum Ada Pembelian Akun Premium</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Mulai berbelanja akun premium favorit Anda dan nikmati layanan terbaik.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Belanja Sekarang
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* IndoSMM Tab - Mobile Optimized */}
          <TabsContent value="indosmm">
            <div className="space-y-4">
              {filteredIndoSMMOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const indosmmStatusConfig = getStatusConfig(order.order_details?.indosmm_status || "")
                const StatusIcon = statusConfig.icon
                return (
                  <Card key={order.id} className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      {/* Mobile Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                            {order.order_details?.service_name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge
                              className={`${statusConfig.color} text-white text-xs px-2 py-1 flex items-center gap-1`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.text}
                            </Badge>
                            {order.order_details?.indosmm_status && (
                              <Badge className="bg-purple-500 text-white text-xs px-2 py-1">
                                {order.order_details.indosmm_status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("id-ID")}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Details Grid */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Hash className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Order ID</div>
                            <div className="font-mono text-sm truncate">{order.order_number}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(order.order_number)}
                            className="p-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Target className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Target</div>
                            <div className="text-sm font-medium truncate" title={order.order_details?.target}>
                              {order.order_details?.target}
                            </div>
                          </div>
                          {order.order_details?.target && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(order.order_details.target, "_blank")}
                              className="p-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Quantity</div>
                              <div className="text-sm font-bold">{order.order_details?.quantity?.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Tanggal</div>
                              <div className="text-sm font-medium">
                                {new Date(order.created_at).toLocaleDateString("id-ID")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {order.order_details?.indosmm_order_id && (
                          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Hash className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">IndoSMM Order ID</div>
                              <div className="font-mono text-sm font-bold text-amber-700">
                                {order.order_details.indosmm_order_id}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIndoSMMOrder(order)}
                          className="flex-1 border-gray-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                        {order.order_details?.target && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(order.order_details.target, "_blank")}
                            className="border-gray-200"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredIndoSMMOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Belum Ada Order IndoSMM</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Mulai tingkatkan media sosial Anda dengan layanan IndoSMM terbaik.
                  </p>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                    Pesan Layanan SMM
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Account Details Modal */}
        {selectedAccount && (
          <AccountDetailsModal
            order={selectedAccount}
            isOpen={!!selectedAccount}
            onClose={() => setSelectedAccount(null)}
          />
        )}

        {/* IndoSMM Order Modal */}
        {selectedIndoSMMOrder && (
          <IndoSMMOrderModal
            order={selectedIndoSMMOrder}
            isOpen={!!selectedIndoSMMOrder}
            onClose={() => setSelectedIndoSMMOrder(null)}
          />
        )}
      </div>
    </div>
  )
}
