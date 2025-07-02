"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  ExternalLink,
  User,
  Package,
  Target,
  Hash,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  X,
  Eye,
  BarChart3,
  Mail,
  Tag,
  Activity,
} from "lucide-react"

interface IndoSMMOrder {
  id: number
  order_number: string
  user_name: string
  user_email: string
  service_name: string
  service_category: string
  target: string
  quantity: number
  price: number
  indosmm_order_id: number | null
  indosmm_status: string
  start_count: number
  remains: number
  created_at: string
  updated_at: string
}

interface IndoSMMOrderViewModalProps {
  order: IndoSMMOrder
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function IndoSMMOrderViewModal({ order, isOpen, onClose, onRefresh }: IndoSMMOrderViewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "completed":
        return {
          variant: "default" as const,
          color: "text-green-700",
          bgColor: "from-green-50 to-emerald-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
          description: "Order telah selesai dikerjakan",
        }
      case "in progress":
        return {
          variant: "secondary" as const,
          color: "text-blue-700",
          bgColor: "from-blue-50 to-indigo-50",
          borderColor: "border-blue-200",
          icon: Loader2,
          description: "Order sedang dalam proses pengerjaan",
        }
      case "pending":
        return {
          variant: "outline" as const,
          color: "text-amber-700",
          bgColor: "from-amber-50 to-orange-50",
          borderColor: "border-amber-200",
          icon: Clock,
          description: "Order menunggu untuk diproses",
        }
      case "partial":
        return {
          variant: "secondary" as const,
          color: "text-orange-700",
          bgColor: "from-orange-50 to-red-50",
          borderColor: "border-orange-200",
          icon: AlertCircle,
          description: "Order selesai sebagian",
        }
      case "canceled":
      case "cancelled":
        return {
          variant: "destructive" as const,
          color: "text-red-700",
          bgColor: "from-red-50 to-pink-50",
          borderColor: "border-red-200",
          icon: XCircle,
          description: "Order telah dibatalkan",
        }
      case "failed":
        return {
          variant: "destructive" as const,
          color: "text-red-700",
          bgColor: "from-red-50 to-pink-50",
          borderColor: "border-red-200",
          icon: XCircle,
          description: "Order gagal diproses",
        }
      default:
        return {
          variant: "outline" as const,
          color: "text-gray-700",
          bgColor: "from-gray-50 to-slate-50",
          borderColor: "border-gray-200",
          icon: Activity,
          description: "Status tidak diketahui",
        }
    }
  }

  const calculateProgress = () => {
    if (!order.indosmm_order_id || order.start_count === 0) return 0
    const delivered = order.quantity - order.remains
    return Math.max(0, Math.min(100, (delivered / order.quantity) * 100))
  }

  const handleOpenTarget = () => {
    const target = order.target
    let url = target

    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.startsWith("@") || target.includes("instagram.com") || target.includes("tiktok.com")) {
        url = `https://${target.replace("@", "")}`
      } else {
        url = `https://${target}`
      }
    }

    window.open(url, "_blank")
  }

  const statusInfo = getStatusInfo(order.indosmm_status || "pending")
  const StatusIcon = statusInfo.icon
  const progress = calculateProgress()
  const delivered = order.quantity - order.remains

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl">Detail Order IndoSMM</div>
                <div className="text-sm font-normal text-gray-600">#{order.order_number}</div>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                {order.indosmm_status || "pending"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-amber-100 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview Card */}
          <Card
            className={`border-0 shadow-xl bg-gradient-to-r ${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md`}>
                  <StatusIcon
                    className={`h-6 w-6 ${statusInfo.color} ${statusInfo.icon === Loader2 ? "animate-spin" : ""}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-bold text-lg ${statusInfo.color}`}>
                      Status: {order.indosmm_status || "Pending"}
                    </h3>
                  </div>
                  <p className={`text-sm ${statusInfo.color} opacity-80`}>{statusInfo.description}</p>
                </div>
                {order.indosmm_order_id && (
                  <Button
                    onClick={onRefresh}
                    size="sm"
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                    <Hash className="h-4 w-4 text-white" />
                  </div>
                  Informasi Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Order Number</span>
                    </div>
                    <p className="font-mono text-blue-800 font-bold">{order.order_number}</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">IndoSMM Order ID</span>
                    </div>
                    <p className="font-mono text-blue-800 font-bold">{order.indosmm_order_id || "Belum ditetapkan"}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Dibuat</span>
                      </div>
                      <p className="text-blue-800 text-sm font-medium">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Update Terakhir</span>
                      </div>
                      <p className="text-blue-800 text-sm font-medium">
                        {new Date(order.updated_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Informasi Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Detail Customer</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-green-700">Nama:</span>
                      <p className="text-green-800 font-bold">{order.user_name}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Email:</span>
                      </div>
                      <p className="text-green-800 font-medium break-all">{order.user_email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <Package className="h-4 w-4 text-white" />
                </div>
                Informasi Layanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                <h4 className="font-bold text-purple-900 mb-3 text-lg line-clamp-2">{order.service_name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Kategori</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                      {order.service_category}
                    </Badge>
                  </div>

                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Quantity</span>
                    </div>
                    <p className="font-bold text-purple-800 text-lg">{order.quantity.toLocaleString()}</p>
                  </div>

                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-purple-700">Harga</span>
                    </div>
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(order.price)}</p>
                  </div>

                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Target</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenTarget}
                        className="bg-white hover:bg-purple-50 border-purple-300 text-purple-600"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Lihat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Target URL/Username</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="flex-1 break-all text-sm text-purple-800 font-mono bg-white p-2 rounded border">
                    {order.target}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenTarget}
                    className="bg-white hover:bg-purple-50 border-purple-300 text-purple-600 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Information */}
          {order.indosmm_order_id && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Informasi Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{order.start_count.toLocaleString()}</div>
                    <div className="text-sm font-medium text-blue-700">Start Count</div>
                    <div className="text-xs text-blue-600 mt-1">Jumlah awal</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{delivered.toLocaleString()}</div>
                    <div className="text-sm font-medium text-green-700">Delivered</div>
                    <div className="text-xs text-green-600 mt-1">Sudah terkirim</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{order.remains.toLocaleString()}</div>
                    <div className="text-sm font-medium text-orange-700">Remaining</div>
                    <div className="text-xs text-orange-600 mt-1">Sisa yang belum</div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-amber-800">Progress Pengerjaan</span>
                    <span className="text-lg font-bold text-amber-600">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-amber-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </Progress>
                  <div className="flex justify-between text-xs text-amber-700 mt-2">
                    <span>0</span>
                    <span>{order.quantity.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="bg-amber-200" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleOpenTarget}
              className="flex-1 h-12 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-700 font-medium"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Buka Target
            </Button>
            {order.indosmm_order_id && (
              <Button
                onClick={onRefresh}
                variant="outline"
                className="flex-1 h-12 bg-white hover:bg-blue-50 border-2 border-blue-300 text-blue-700 font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Status
              </Button>
            )}
            <Button
              onClick={onClose}
              className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
