"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, ExternalLink, User, Package, Target, Hash } from "lucide-react"

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "in progress":
        return "secondary"
      case "pending":
        return "outline"
      case "partial":
        return "secondary"
      case "canceled":
      case "cancelled":
        return "destructive"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const calculateProgress = () => {
    if (!order.indosmm_order_id || order.start_count === 0) return 0
    const delivered = order.quantity - order.remains
    return Math.max(0, Math.min(100, (delivered / order.quantity) * 100))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>IndoSMM Order Details</span>
            <Badge variant={getStatusColor(order.indosmm_status)}>{order.indosmm_status || "pending"}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Hash className="h-5 w-5 mr-2" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Number</label>
                  <p className="font-mono">{order.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IndoSMM Order ID</label>
                  <p className="font-mono">{order.indosmm_order_id || "Not assigned yet"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p>{new Date(order.created_at).toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p>{new Date(order.updated_at).toLocaleString("id-ID")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p>{order.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{order.user_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Name</label>
                  <p>{order.service_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <Badge variant="outline">{order.service_category}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p>{order.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="font-semibold text-green-600">{formatCurrency(order.price)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-500">Target</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Target className="h-4 w-4 text-gray-400" />
                  <p className="break-all">{order.target}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(order.target, "_blank")}
                    className="h-6 w-6"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Information */}
          {order.indosmm_order_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{order.start_count}</div>
                    <div className="text-sm text-gray-500">Start Count</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{order.quantity - order.remains}</div>
                    <div className="text-sm text-gray-500">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{order.remains}</div>
                    <div className="text-sm text-gray-500">Remaining</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{calculateProgress().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {order.indosmm_order_id && (
              <Button onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
