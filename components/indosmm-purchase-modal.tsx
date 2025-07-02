"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Clock, TrendingUp, X, AlertCircle } from "lucide-react"
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
          service_id: service.id, // Use the correct field name
          target: formData.target,
          quantity: quantity,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Order created successfully:", data)
        console.log("🎯 Redirecting to payment page...")
        // Redirect to payment page
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
      <DialogContent className="max-w-md bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Konfirmasi Pemesanan
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {service.image_url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={service.image_url || "/placeholder.svg"}
                      alt={service.category}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <Badge variant="secondary">{service.category}</Badge>
                    {userRole === "reseller" && <Badge className="bg-green-500">Reseller Price</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Min: {service.min_order.toLocaleString()}</span>
                    <span>Max: {service.max_order.toLocaleString()}</span>
                    <span className="font-medium text-blue-600">{formatPrice(rate)} / 1K</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Service ID: {service.service_id}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="target" className="text-sm font-medium text-gray-700">
                Target URL/Username *
              </Label>
              <Input
                id="target"
                placeholder="@username atau https://..."
                value={formData.target}
                onChange={(e) => handleInputChange("target", e.target.value)}
                className={errors.target ? "border-red-500" : ""}
              />
              {errors.target && <p className="text-sm text-red-500 mt-1">{errors.target}</p>}
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                min={service.min_order}
                max={service.max_order}
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={errors.quantity ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {service.min_order.toLocaleString()}</span>
                <span>Max: {service.max_order.toLocaleString()}</span>
              </div>
              {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Order Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 text-blue-900">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Rate per 1K:</span>
                  <span className="font-medium">{formatPrice(rate)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-blue-900">Total:</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pastikan target akun tidak dalam mode private dan dapat diakses publik. Order akan otomatis dikirim ke
              IndoSMM setelah pembayaran berhasil.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || totalPrice <= 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatPrice(totalPrice)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
