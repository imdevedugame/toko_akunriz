"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Heart,
  MessageCircle,
  Eye,
  UserPlus,
  Share2,
  Calendar,
  DollarSign,
  Package,
  Target,
  TrendingUp,
  Info,
} from "lucide-react"

interface SocialService {
  id: number
  category_id: number
  name: string
  description: string
  service_type: string
  price_user: number
  price_reseller: number
  min_order: number
  max_order: number
  features: string[]
  status: string
  service_mode: string
  created_at: string
  updated_at: string
  category_name: string
  category_slug: string
}

interface SocialServiceViewModalProps {
  service: SocialService | null
  isOpen: boolean
  onClose: () => void
}

const serviceTypeIcons = {
  followers: Users,
  likes: Heart,
  comments: MessageCircle,
  views: Eye,
  subscribers: UserPlus,
  shares: Share2,
}

const serviceTypeColors = {
  followers: "bg-blue-100 text-blue-800",
  likes: "bg-red-100 text-red-800",
  comments: "bg-green-100 text-green-800",
  views: "bg-purple-100 text-purple-800",
  subscribers: "bg-orange-100 text-orange-800",
  shares: "bg-pink-100 text-pink-800",
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  draft: "bg-yellow-100 text-yellow-800",
}

export function SocialServiceViewModal({ service, isOpen, onClose }: SocialServiceViewModalProps) {
  if (!service) return null

  const ServiceIcon = serviceTypeIcons[service.service_type as keyof typeof serviceTypeIcons] || Users

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  const calculateDiscount = () => {
    if (service.price_user <= service.price_reseller) return 0
    return Math.round(((service.price_user - service.price_reseller) / service.price_user) * 100)
  }

  const getOrderRange = () => {
    const min = formatNumber(service.min_order)
    const max = formatNumber(service.max_order)
    return `${min} - ${max}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <ServiceIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">{service.name}</div>
              <div className="text-sm text-gray-500 font-normal">
                ID: #{service.id.toString().padStart(4, "0")} • Category: {service.category_name}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={serviceTypeColors[service.service_type as keyof typeof serviceTypeColors]}>
              <ServiceIcon className="h-3 w-3 mr-1" />
              {service.service_type.charAt(0).toUpperCase() + service.service_type.slice(1)}
            </Badge>
            <Badge className={statusColors[service.status as keyof typeof statusColors]}>
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </Badge>
            <Badge variant="outline">{service.service_mode === "package" ? "Package Mode" : "Custom Mode"}</Badge>
            <Badge variant="outline">Category ID: {service.category_id}</Badge>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi Layanan</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Harga User</h3>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(service.price_user)}</div>
                <div className="text-sm text-gray-500">
                  {service.service_mode === "custom"
                    ? "Harga per 1000 untuk user biasa"
                    : "Harga base untuk user biasa"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Harga Reseller</h3>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(service.price_reseller)}</div>
                <div className="text-sm text-gray-500">
                  {calculateDiscount() > 0 ? (
                    <span className="text-green-600 font-medium">Diskon {calculateDiscount()}% dari harga user</span>
                  ) : (
                    "Sama dengan harga user"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Limits */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Batas Pemesanan</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Minimum Order</div>
                  <div className="text-xl font-bold text-gray-900">{formatNumber(service.min_order)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Maximum Order</div>
                  <div className="text-xl font-bold text-gray-900">{formatNumber(service.max_order)}</div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Range Order:</strong> {getOrderRange()} {service.service_type}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {service.features && service.features.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold">Fitur Layanan</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Analysis */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold">Analisis Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Selisih Harga</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(service.price_user - service.price_reseller)}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Margin Reseller</div>
                  <div className="text-lg font-bold text-green-600">{calculateDiscount()}%</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Range Order</div>
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(service.max_order / service.min_order)}x
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                <strong>Dibuat:</strong> {new Date(service.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                <strong>Diperbarui:</strong> {new Date(service.updated_at).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
