"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ExternalLink,
  TrendingUp,
  Target,
  Hash,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  X,
  Info,
  Eye,
} from "lucide-react"

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

interface IndoSMMOrderModalProps {
  order: IndoSMMOrder
  isOpen: boolean
  onClose: () => void
}

export function IndoSMMOrderModal({ order, isOpen, onClose }: IndoSMMOrderModalProps) {
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
          bgColor: "bg-green-100",
          icon: CheckCircle,
          description: "Order telah selesai dikerjakan",
        }
      case "in progress":
        return {
          variant: "secondary" as const,
          color: "text-blue-700",
          bgColor: "bg-blue-100",
          icon: Loader2,
          description: "Order sedang dalam proses pengerjaan",
        }
      case "pending":
        return {
          variant: "outline" as const,
          color: "text-amber-700",
          bgColor: "bg-amber-100",
          icon: Clock,
          description: "Order menunggu untuk diproses",
        }
      case "partial":
        return {
          variant: "secondary" as const,
          color: "text-orange-700",
          bgColor: "bg-orange-100",
          icon: AlertCircle,
          description: "Order selesai sebagian",
        }
      case "canceled":
      case "cancelled":
        return {
          variant: "destructive" as const,
          color: "text-red-700",
          bgColor: "bg-red-100",
          icon: XCircle,
          description: "Order telah dibatalkan",
        }
      case "failed":
        return {
          variant: "destructive" as const,
          color: "text-red-700",
          bgColor: "bg-red-100",
          icon: XCircle,
          description: "Order gagal diproses",
        }
      default:
        return {
          variant: "outline" as const,
          color: "text-gray-700",
          bgColor: "bg-gray-100",
          icon: Info,
          description: "Status tidak diketahui",
        }
    }
  }

  const statusInfo = getStatusInfo(order.order_details.indosmm_status || "pending")
  const StatusIcon = statusInfo.icon

  const handleOpenTarget = () => {
    const target = order.order_details.target
    let url = target

    // Add protocol if missing
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.startsWith("@") || target.includes("instagram.com") || target.includes("tiktok.com")) {
        url = `https://${target.replace("@", "")}`
      } else {
        url = `https://${target}`
      }
    }

    window.open(url, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-0 shadow-2xl">
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
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-amber-100 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`border-0 shadow-xl ${statusInfo.bgColor} border-2`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${statusInfo.bgColor} rounded-xl flex items-center justify-center shadow-md`}
                >
                  <StatusIcon
                    className={`h-6 w-6 ${statusInfo.color} ${statusInfo.icon === Loader2 ? "animate-spin" : ""}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-bold text-lg ${statusInfo.color}`}>
                      Status: {order.order_details.indosmm_status || "Pending"}
                    </h3>
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {order.order_details.indosmm_status || "pending"}
                    </Badge>
                  </div>
                  <p className={`text-sm ${statusInfo.color} opacity-80`}>{statusInfo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <Package className="h-4 w-4 text-white" />
                </div>
                Informasi Layanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 line-clamp-2">{order.order_details.service_name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-blue-600 font-medium">Quantity:</span>
                      <span className="ml-2 font-bold text-blue-800">
                        {order.order_details.quantity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-blue-600 font-medium">Total:</span>
                      <span className="ml-2 font-bold text-green-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Target Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium text-green-700 mb-2 block">Target URL/Username</label>
                    <p className="break-all text-sm text-green-800 font-mono bg-white p-2 rounded border">
                      {order.order_details.target}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleOpenTarget}
                      className="bg-white hover:bg-green-50 border-green-300 text-green-600 hover:text-green-700"
                      title="Buka Target"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-green-50 border-green-300 text-green-600"
                      title="Lihat Target"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <Hash className="h-4 w-4 text-white" />
                </div>
                Detail Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Order ID</span>
                  </div>
                  <p className="font-mono text-purple-800 font-bold">{order.order_number}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Tanggal Order</span>
                  </div>
                  <p className="text-purple-800 font-bold">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {order.order_details.indosmm_order_id && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">IndoSMM ID</span>
                      </div>
                      <p className="font-mono text-purple-800 font-bold">{order.order_details.indosmm_order_id}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Status IndoSMM</span>
                      </div>
                      <Badge variant={statusInfo.variant} className="font-bold">
                        {order.order_details.indosmm_status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Guide */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-amber-900">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <Info className="h-4 w-4 text-white" />
                </div>
                Panduan Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { status: "Pending", desc: "Order sedang menunggu diproses", color: "text-amber-700" },
                  { status: "In Progress", desc: "Sedang dalam pengerjaan", color: "text-blue-700" },
                  { status: "Completed", desc: "Order telah selesai", color: "text-green-700" },
                  { status: "Partial", desc: "Selesai sebagian", color: "text-orange-700" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white/50 rounded border border-amber-200">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <span className={`font-semibold ${item.color}`}>{item.status}:</span>
                      <span className="ml-1 text-amber-800">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
