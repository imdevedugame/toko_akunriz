"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface ServiceViewModalProps {
  service: any
  isOpen: boolean
  onClose: () => void
}

export function ServiceViewModal({ service, isOpen, onClose }: ServiceViewModalProps) {
  if (!service) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {service.image_url && (
              <div className="relative w-8 h-8">
                <Image
                  src={service.image_url || "/placeholder.svg"}
                  alt={service.category}
                  fill
                  className="object-contain rounded"
                />
              </div>
            )}
            <span>{service.name}</span>
            <Badge variant={getStatusColor(service.status)}>{service.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Service ID</p>
                  <p className="font-mono">{service.service_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <Badge variant="outline">{service.category}</Badge>
                </div>
              </div>

              {service.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm">{service.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Base Rate</p>
                  <p className="text-lg font-bold">{formatCurrency(service.rate)}</p>
                  <p className="text-xs text-gray-400">Provider cost</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">User Rate</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(service.user_rate)}</p>
                  <p className="text-xs text-gray-400">+20% markup</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Reseller Rate</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(service.reseller_rate)}</p>
                  <p className="text-xs text-gray-400">+10% markup</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Order Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Minimum Order</p>
                  <p className="text-lg font-bold text-orange-600">{service.min_order.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Maximum Order</p>
                  <p className="text-lg font-bold text-purple-600">{service.max_order.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm">{formatDate(service.created_at)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm">{formatDate(service.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Profit Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">User Profit</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(service.user_rate - service.rate)}</p>
                  <p className="text-xs text-gray-400">Per transaction</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Reseller Profit</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(service.reseller_rate - service.rate)}
                  </p>
                  <p className="text-xs text-gray-400">Per transaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
