"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Clock, TrendingUp, X, AlertCircle, User, Hash, MessageSquare, ShoppingCart, CheckCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface IndoSMMService {
  id: number
  service_id: number
  name: string
  category: string
  rate: number
  min_order: number
  max_order: number
  user_rate: number
  reseller_rate: number
  image_url?: string
}

interface OrderData {
  target: string
  quantity: string
  notes: string
}

interface IndoSMMPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  service: IndoSMMService
  initialTarget?: string
  initialQuantity?: string
  userRole?: string
}

export function IndoSMMPurchaseModal({
  isOpen,
  onClose,
  service,
  initialTarget = "",
  initialQuantity = "",
  userRole = "user",
}: IndoSMMPurchaseModalProps) {
  const [formData, setFormData] = useState<OrderData>({
    target: initialTarget,
    quantity: initialQuantity || service.min_order.toString(),
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const rate = userRole === "reseller" ? service.reseller_rate : service.user_rate
  const quantity = Number.parseInt(formData.quantity) || 0
  const totalPrice = (rate * quantity) / 1000

  const formatPrice = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount) || amount < 0) {
      return "Rp 0"
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.target.trim()) {
      newErrors.target = "Target URL atau username harus diisi"
    }

    if (!formData.quantity || quantity < service.min_order) {
      newErrors.quantity = `Minimum order adalah ${service.min_order.toLocaleString()}`
    }

    if (quantity > service.max_order) {
      newErrors.quantity = `Maximum order adalah ${service.max_order.toLocaleString()}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      console.log("🛒 Submitting IndoSMM order:", {
        serviceId: service.id,
        target: formData.target,
        quantity: quantity,
        notes: formData.notes,
      })

      const response = await fetch("/api/indosmm-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: service.id,
          target: formData.target,
          quantity: quantity,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Order created successfully:", data)
        console.log("🎯 Redirecting to payment page...")
        window.location.href = data.order.payment_url
      } else {
        console.error("❌ Order creation failed:", data)
        alert(data.error || "Gagal membuat pesanan")
      }
    } catch (error) {
      console.error("💥 Order creation error:", error)
      alert("Terjadi kesalahan saat membuat pesanan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof OrderData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl">Form Pemesanan</div>
                <div className="text-sm font-normal text-gray-600">Layanan Social Media Marketing</div>
              </div>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-amber-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Service Image or Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md overflow-hidden">
                  {service.image_url ? (
                    <Image
                      src="/sosmed.png"
                      alt={service.category}
                      width={56}
                      height={56}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <TrendingUp className="h-7 w-7 text-white" />
                  )}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-2">
                      {service.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs"
                      >
                        {service.category}
                      </Badge>
                      {userRole === "reseller" && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                          Reseller Price
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs sm:text-sm">
                    <div className="flex flex-col items-start">
                      <span className="text-gray-600">Min</span>
                      <span className="font-medium">{service.min_order.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-600">Max</span>
                      <span className="font-medium">{service.max_order.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-600">Rate</span>
                      <span className="font-bold text-amber-600">{formatPrice(rate)} / 1K</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Service ID: {service.service_id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-5">
                {/* Target Field */}
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Target URL/Username *
                  </Label>
                  <Input
                    id="target"
                    placeholder="@username atau https://..."
                    value={formData.target}
                    onChange={(e) => handleInputChange("target", e.target.value)}
                    className={`h-11 border-2 transition-colors ${
                      errors.target 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-blue-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.target && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.target}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Pastikan akun tidak dalam mode private
                  </div>
                </div>

                {/* Quantity Field */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-500" />
                    Jumlah *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={service.min_order}
                    max={service.max_order}
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className={`h-11 border-2 transition-colors ${
                      errors.quantity 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-blue-200 focus:border-blue-500"
                    }`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {service.min_order.toLocaleString()}</span>
                    <span>Max: {service.max_order.toLocaleString()}</span>
                  </div>
                  {errors.quantity && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.quantity}
                    </div>
                  )}
                </div>

                {/* Notes Field */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Catatan (Opsional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan tambahan untuk pesanan..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="border-2 border-blue-200 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-bold text-green-900 text-base sm:text-lg">Ringkasan Pesanan</h4>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-gray-600">Layanan:</span>
                    <span className="font-medium text-right sm:text-left line-clamp-2">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-gray-600">Jumlah:</span>
                    <span className="font-medium">{quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-gray-600">Rate per 1K:</span>
                    <span className="font-medium">{formatPrice(rate)}</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-gray-600">Kategori:</span>
                    <span className="font-medium">{service.category}</span>
                  </div>
                </div>
                
                <Separator className="bg-green-200" />
                
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <span className="text-lg font-bold text-green-900">Total Pembayaran:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Penting:</strong> Pastikan target akun dapat diakses publik dan tidak dalam mode private. 
              Pesanan akan otomatis diproses setelah pembayaran berhasil dikonfirmasi.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 font-medium"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || totalPrice <= 0 || Object.keys(errors).length > 0}
              className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Bayar {formatPrice(totalPrice)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
