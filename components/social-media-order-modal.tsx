"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Package, Zap, Info } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface SocialService {
  id: number
  name: string
  description: string
  category_name: string
  service_type: "followers" | "likes" | "comments" | "views" | "subscribers" | "shares"
  min_order: number
  max_order: number
  price_user: number
  price_reseller: number
  service_mode: "custom" | "package"
  package_count: number
}

interface ServicePackage {
  id: number
  name: string
  description: string
  quantity: number
  price_user: number
  price_reseller: number
}

interface SocialMediaOrderModalProps {
  service: SocialService | null
  isOpen: boolean
  onClose: () => void
}

export function SocialMediaOrderModal({ service, isOpen, onClose }: SocialMediaOrderModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null)
  const [orderType, setOrderType] = useState<"package" | "custom">("package")

  const [formData, setFormData] = useState({
    quantity: 0,
    target_url: "",
    whatsapp_number: "",
    comments: "",
    description: "",
  })
useEffect(() => {
  if (service && isOpen) {
    // Reset form
    setFormData({
      quantity: service.service_mode === "custom" ? service.min_order : 0,
      target_url: "",
      whatsapp_number: "",
      comments: "",
      description: "",
    })

    if (service.service_mode === "package") {
      fetchPackages()
      setOrderType("package")
    } else {
      setOrderType("custom")
    }
  }
}, [service, isOpen])

  const fetchPackages = async () => {
    if (!service) return

    try {
      const response = await fetch(`/api/social-services/${service.id}/packages`)
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
        if (data.packages.length > 0) {
          setSelectedPackage(data.packages[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error)
    }
  }

  const calculateCustomPrice = () => {
    if (!service || !formData.quantity) return 0
    const pricePerUnit = user?.role === "reseller" ? service.price_reseller : service.price_user
    return Math.ceil((formData.quantity / 1000) * pricePerUnit)
  }

  const getTotalAmount = () => {
    if (orderType === "package" && selectedPackage) {
      return user?.role === "reseller" ? selectedPackage.price_reseller : selectedPackage.price_user
    }
    return calculateCustomPrice()
  }

  const getQuantity = () => {
    if (orderType === "package" && selectedPackage) {
      return selectedPackage.quantity
    }
    return formData.quantity
  }

  const getUrlPlaceholder = () => {
    if (!service) return "https://instagram.com/username"

    const category = service.category_name.toLowerCase()
    const serviceType = service.service_type

    if (serviceType === "followers" || serviceType === "subscribers") {
      // For followers/subscribers, we need profile URL
      switch (category) {
        case "instagram":
          return "https://instagram.com/username"
        case "facebook":
          return "https://facebook.com/username"
        case "twitter":
        case "x":
          return "https://twitter.com/username"
        case "youtube":
          return "https://youtube.com/@username"
        case "tiktok":
          return "https://tiktok.com/@username"
        case "linkedin":
          return "https://linkedin.com/in/username"
        case "telegram":
          return "https://t.me/username"
        default:
          return "https://instagram.com/username"
      }
    } else {
      // For likes, comments, views, shares - we need post URL
      switch (category) {
        case "instagram":
          return "https://instagram.com/p/ABC123/"
        case "facebook":
          return "https://facebook.com/posts/123456"
        case "twitter":
        case "x":
          return "https://twitter.com/username/status/123456"
        case "youtube":
          return "https://youtube.com/watch?v=ABC123"
        case "tiktok":
          return "https://tiktok.com/@username/video/123456"
        case "linkedin":
          return "https://linkedin.com/posts/activity-123456"
        default:
          return "https://instagram.com/p/ABC123/"
      }
    }
  }

  const getUrlLabel = () => {
    if (!service) return "Target URL"

    const serviceType = service.service_type

    if (serviceType === "followers" || serviceType === "subscribers") {
      return "Profile URL"
    } else {
      return "Post URL"
    }
  }

  const getUrlDescription = () => {
    if (!service) return "URL yang akan diproses"

    const serviceType = service.service_type

    if (serviceType === "followers" || serviceType === "subscribers") {
      return "URL profil akun yang akan mendapat followers/subscribers"
    } else {
      return "URL postingan yang akan mendapat likes/comments/views/shares"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !user) return

    setIsLoading(true)

    try {
      const orderData = {
        service_id: service.id,
        package_id: orderType === "package" ? selectedPackage?.id : null,
        quantity: getQuantity(),
        target_url: formData.target_url,
        whatsapp_number: formData.whatsapp_number,
        comments: service.service_type === "comments" ? formData.comments : null,
        description: formData.description || null,
        is_custom: orderType === "custom",
      }

      const response = await fetch("/api/social-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment or show success
        if (data.payment_url) {
          window.location.href = data.payment_url
        } else {
          alert(`Order created successfully! Order Number: ${data.order_number}`)
          onClose()
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Failed to create order:", error)
      alert("Failed to create order")
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

  const isFormValid = () => {
    if (!formData.target_url || !formData.whatsapp_number) return false
    if (service?.service_type === "comments" && !formData.comments.trim()) return false
    if (
      orderType === "custom" &&
      (!formData.quantity || formData.quantity < service?.min_order! || formData.quantity > service?.max_order!)
    )
      return false
    if (orderType === "package" && !selectedPackage) return false
    return true
  }

  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order {service.name}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {service.category_name} • {service.service_type}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Mode Selection */}
          {service.service_mode === "package" && packages.length > 0 ? (
            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "package" | "custom")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="package" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Pilih Paket
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Custom
                </TabsTrigger>
              </TabsList>

              {/* Package Selection */}
              <TabsContent value="package" className="space-y-4">
                <div>
                  <Label>Pilih Paket</Label>
                  <div className="grid gap-3 mt-2">
                    {packages.map((pkg) => (
                      <Card
                        key={pkg.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPackage?.id === pkg.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{pkg.name}</h4>
                              {pkg.description && <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span>Quantity: {pkg.quantity.toLocaleString()}</span>
                                <Badge variant="outline">
                                  {formatCurrency(user?.role === "reseller" ? pkg.price_reseller : pkg.price_user)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Custom Order */}
              <TabsContent value="custom" className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                    }
                    min={service.min_order}
                    max={service.max_order}
                    placeholder={`Min: ${service.min_order}, Max: ${service.max_order}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rate: {formatCurrency(user?.role === "reseller" ? service.price_reseller : service.price_user)} per
                    1,000
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // Custom only mode
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))}
                min={service.min_order}
                max={service.max_order}
                placeholder={`Min: ${service.min_order}, Max: ${service.max_order}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate: {formatCurrency(user?.role === "reseller" ? service.price_reseller : service.price_user)} per
                1,000
              </p>
            </div>
          )}

          {/* Target URL */}
          <div>
            <Label htmlFor="target_url">{getUrlLabel()} *</Label>
            <Input
              id="target_url"
              type="url"
              value={formData.target_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, target_url: e.target.value }))}
              placeholder={getUrlPlaceholder()}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{getUrlDescription()}</p>
          </div>

          {/* Comments Field - Only show for comment services */}
          {service.service_type === "comments" && (
            <div>
              <Label htmlFor="comments">Comments *</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder="Masukkan komentar yang ingin diberikan (pisahkan dengan enter untuk multiple comments)"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tulis komentar yang ingin diberikan. Untuk multiple comments, pisahkan dengan enter (baris baru)
              </p>
            </div>
          )}

          {/* Description Field */}
          <div>
            <Label htmlFor="description">Deskripsi Tambahan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tambahkan catatan atau instruksi khusus untuk pesanan ini (opsional)"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Berikan detail tambahan atau instruksi khusus yang perlu diperhatikan untuk pesanan ini
            </p>
          </div>

          {/* WhatsApp Number */}
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
              placeholder="628123456789"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Nomor WhatsApp untuk update status pesanan</p>
          </div>

          {/* Service Description */}
          {service.description && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Tentang Layanan</h4>
                  <p className="text-sm text-blue-800 mt-1">{service.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Ringkasan Pesanan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Layanan:</span>
                <span>{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span>{service.category_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span className="capitalize">{service.service_type}</span>
              </div>
              {orderType === "package" && selectedPackage && (
                <div className="flex justify-between">
                  <span>Paket:</span>
                  <span>{selectedPackage.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{getQuantity().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Harga per 1000:</span>
                <span>{formatCurrency(user?.role === "reseller" ? service.price_reseller : service.price_user)}</span>
              </div>
              {service.service_type === "comments" && formData.comments && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Comments:</span>
                  <div className="bg-white p-2 rounded text-xs max-h-20 overflow-y-auto">
                    {formData.comments.split("\n").map((comment, index) => (
                      <div key={index} className="mb-1">
                        • {comment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.description && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Deskripsi Tambahan:</span>
                  <div className="bg-white p-2 rounded text-xs">{formData.description}</div>
                </div>
              )}
              <div className="flex justify-between font-medium text-base pt-2 border-t">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(getTotalAmount())}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit"className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Memproses..." : "Pesan Sekarang"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
