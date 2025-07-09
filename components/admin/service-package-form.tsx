"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServicePackage {
  id: number
  service_id: number
  name: string
  description: string
  quantity: number
  price_user: number
  price_reseller: number
  status: string
  service_name: string
}

interface SocialService {
  id: number
  name: string
  service_mode: string
  category_name: string
}

interface ServicePackageFormProps {
  package?: ServicePackage | null
  services: SocialService[]
  onSuccess: () => void
  onCancel: () => void
}

export function ServicePackageForm({ package: pkg, services, onSuccess, onCancel }: ServicePackageFormProps) {
  const [formData, setFormData] = useState({
    service_id: "",
    name: "",
    description: "",
    quantity: "",
    price_user: "",
    price_reseller: "",
    status: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter services to only show package mode services
  const packageServices = services.filter((service) => service.service_mode === "package")

  useEffect(() => {
    if (pkg) {
      setFormData({
        service_id: pkg.service_id.toString(),
        name: pkg.name,
        description: pkg.description || "",
        quantity: pkg.quantity.toString(),
        price_user: pkg.price_user.toString(),
        price_reseller: pkg.price_reseller.toString(),
        status: pkg.status,
      })
    } else {
      setFormData({
        service_id: "",
        name: "",
        description: "",
        quantity: "",
        price_user: "",
        price_reseller: "",
        status: "active",
      })
    }
  }, [pkg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        service_id: Number.parseInt(formData.service_id),
        quantity: Number.parseInt(formData.quantity),
        price_user: Number.parseFloat(formData.price_user),
        price_reseller: Number.parseFloat(formData.price_reseller),
      }

      const url = pkg ? `/api/admin/service-packages/${pkg.id}` : "/api/admin/service-packages"
      const method = pkg ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save package")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to save package")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="service_id">Service *</Label>
        <Select
          value={formData.service_id}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, service_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            {packageServices.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.name} ({service.category_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {packageServices.length === 0 && (
          <div className="text-sm text-amber-600 mt-1">
            No package-mode services available. Create a service with package mode first.
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="name">Package Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Starter Package - 1000 Followers"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Perfect for beginners who want to boost their social media presence..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
          placeholder="1000"
          required
        />
        <div className="text-xs text-gray-500 mt-1">Number of followers/likes/views etc. included in this package</div>
      </div>

      {/* PRICING SECTION - Admin inputs both user and reseller prices */}
      <div className="bg-green-50 p-4 rounded-lg space-y-4">
        <h3 className="font-medium text-green-900">Package Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_user" className="text-green-800">
              User Price (IDR) *
            </Label>
            <Input
              id="price_user"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_user}
              onChange={(e) => setFormData((prev) => ({ ...prev, price_user: e.target.value }))}
              placeholder="15000"
              required
              className="border-green-200"
            />
            <div className="text-xs text-green-600 mt-1">Harga paket untuk user biasa</div>
          </div>

          <div>
            <Label htmlFor="price_reseller" className="text-green-800">
              Reseller Price (IDR) *
            </Label>
            <Input
              id="price_reseller"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_reseller}
              onChange={(e) => setFormData((prev) => ({ ...prev, price_reseller: e.target.value }))}
              placeholder="12000"
              required
              className="border-green-200"
            />
            <div className="text-xs text-green-600 mt-1">Harga paket untuk reseller</div>
          </div>
        </div>
        <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
          💰 Paket biasanya lebih hemat daripada custom order dengan quantity yang sama
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : pkg ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
