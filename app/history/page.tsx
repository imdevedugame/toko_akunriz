"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  Package,
  Eye,
  ExternalLink,
  Globe,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AccountDetailsModal } from "@/components/account-details-modal"

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
  const [premiumOrders, setPremiumOrders] = useState<PremiumOrder[]>([])
  const [socialOrders, setSocialOrders] = useState<SocialOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<PremiumOrder | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      // Fetch premium account orders (products)
      const premiumResponse = await fetch("/api/orders")
      if (premiumResponse.ok) {
        const premiumData = await premiumResponse.json()
        setPremiumOrders(premiumData.orders || [])
      }

      // Fetch Social Media orders
      const socialResponse = await fetch("/api/social-orders")
      if (socialResponse.ok) {
        const socialData = await socialResponse.json()
        setSocialOrders(socialData.orders || [])
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

  const filteredPremiumOrders = premiumOrders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredSocialOrders = socialOrders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_details?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
                <p className="text-gray-500">Silakan login untuk melihat riwayat pembelian Anda.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Pembelian</h1>
          <p className="text-gray-600">Kelola dan lihat semua pembelian Anda</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari order..."
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
              <span>Akun Premium ({premiumOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Social Media ({socialOrders.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Premium Accounts Tab */}
          <TabsContent value="premium">
            <div className="space-y-4">
              {filteredPremiumOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{order.order_details?.product_name}</h3>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-600">Order ID:</span>
                            <div className="font-mono text-gray-900">{order.order_number}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Total:</span>
                            <div className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Tanggal:</span>
                            <div className="text-gray-900">
                              {new Date(order.created_at).toLocaleDateString("id-ID")}
                            </div>
                          </div>
                        </div>

                        {order.status === "completed" && order.order_details?.account_email && (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPremiumOrders.length === 0 && (
                <div className="text-center py-12">
                  <Card>
                    <CardContent className="p-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pembelian akun premium</h3>
                      <p className="text-gray-500">Mulai berbelanja akun premium favorit Anda.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
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
                  <Card>
                    <CardContent className="p-8">
                      <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada order Social Media</h3>
                      <p className="text-gray-500">Mulai tingkatkan media sosial Anda dengan layanan kami.</p>
                    </CardContent>
                  </Card>
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
      </div>
    </div>
  )
}
