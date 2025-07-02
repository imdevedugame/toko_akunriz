"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, TrendingUp, Target, Hash } from "lucide-react"

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Order IndoSMM</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  {order.order_details.service_name}
                </span>
                <Badge variant={getStatusColor(order.order_details.indosmm_status)}>
                  {order.order_details.indosmm_status || "pending"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="font-mono">{order.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Bayar</label>
                  <p className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="font-medium">{order.order_details.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Order</label>
                  <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Target Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Target URL/Username</label>
                  <p className="break-all text-sm mt-1">{order.order_details.target}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(order.order_details.target, "_blank")}
                  className="ml-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* IndoSMM Info */}
          {order.order_details.indosmm_order_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-purple-600" />
                  IndoSMM Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">IndoSMM Order ID:</span>
                    <span className="font-mono">{order.order_details.indosmm_order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={getStatusColor(order.order_details.indosmm_status)}>
                      {order.order_details.indosmm_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Status Explanation:</p>
                <ul className="space-y-1">
                  <li>
                    • <strong>Pending:</strong> Order sedang diproses
                  </li>
                  <li>
                    • <strong>In Progress:</strong> Sedang dikerjakan
                  </li>
                  <li>
                    • <strong>Completed:</strong> Order selesai
                  </li>
                  <li>
                    • <strong>Partial:</strong> Sebagian selesai
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Tutup</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
