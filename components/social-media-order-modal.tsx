"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Package, Info } from "lucide-react"
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

  const [formData, setFormData] = useState({
    target_url: "",
    whatsapp_number: "",
    comments: "",
    description: "",
  })

  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        target_url: "",
        whatsapp_number: "",
        comments: "",
        description: "",
      })
      fetchPackages()
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

  const getTotalAmount = () => {
    return selectedPackage
      ? user?.role === "reseller"
        ? selectedPackage.price_reseller
        : selectedPackage.price_user
      : 0
  }

  const getQuantity = () => {
    return selectedPackage?.quantity || 0
  }

  const getUrlPlaceholder = () => {
    if (!service) return "https://instagram.com/username"
    const category = service.category_name.toLowerCase()
    const serviceType = service.service_type
    if (serviceType === "followers" || serviceType === "subscribers") {
      switch (category) {
        case "instagram": return "https://instagram.com/username"
        case "facebook": return "https://facebook.com/username"
        case "twitter":
        case "x": return "https://twitter.com/username"
        case "youtube": return "https://youtube.com/@username"
        case "tiktok": return "https://tiktok.com/@username"
        case "linkedin": return "https://linkedin.com/in/username"
        case "telegram": return "https://t.me/username"
        default: return "https://instagram.com/username"
      }
    } else {
      switch (category) {
        case "instagram": return "https://instagram.com/p/ABC123/"
        case "facebook": return "https://facebook.com/posts/123456"
        case "twitter":
        case "x": return "https://twitter.com/username/status/123456"
        case "youtube": return "https://youtube.com/watch?v=ABC123"
        case "tiktok": return "https://tiktok.com/@username/video/123456"
        case "linkedin": return "https://linkedin.com/posts/activity-123456"
        default: return "https://instagram.com/p/ABC123/"
      }
    }
  }

  const getUrlLabel = () => {
    if (!service) return "Target URL"
    return service.service_type === "followers" || service.service_type === "subscribers"
      ? "Profile URL"
      : "Post URL"
  }

  const getUrlDescription = () => {
    if (!service) return "URL yang akan diproses"
    return service.service_type === "followers" || service.service_type === "subscribers"
      ? "URL profil akun yang akan mendapat followers/subscribers"
      : "URL postingan yang akan mendapat likes/comments/views/shares"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !user || !selectedPackage) return
    setIsLoading(true)
    try {
      const orderData = {
        service_id: service.id,
        package_id: selectedPackage.id,
        quantity: getQuantity(),
        target_url: formData.target_url,
        whatsapp_number: formData.whatsapp_number,
        comments: service.service_type === "comments" ? formData.comments : null,
        description: formData.description || null,
        is_custom: false,
      }
      const response = await fetch("/api/social-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      if (response.ok) {
        const data = await response.json()
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
    if (!selectedPackage) return false
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
          <div className="space-y-4">
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

          {service.service_type === "comments" && (
            <div>
              <Label htmlFor="comments">Comments *</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder="Masukkan komentar (pisahkan dengan enter untuk multiple)"
                rows={4}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Deskripsi Tambahan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Catatan atau instruksi khusus (opsional)"
              rows={3}
            />
          </div>

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
          </div>

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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Ringkasan Pesanan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Layanan:</span><span>{service.name}</span></div>
              <div className="flex justify-between"><span>Platform:</span><span>{service.category_name}</span></div>
              <div className="flex justify-between"><span>Tipe:</span><span className="capitalize">{service.service_type}</span></div>
              {selectedPackage && (
                <div className="flex justify-between"><span>Paket:</span><span>{selectedPackage.name}</span></div>
              )}
              <div className="flex justify-between"><span>Quantity:</span><span>{getQuantity().toLocaleString()}</span></div>
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

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Memproses..." : "Pesan Sekarang"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}