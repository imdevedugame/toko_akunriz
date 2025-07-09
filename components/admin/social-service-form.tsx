"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
}

interface SocialCategory {
  id: number
  name: string
  status: string
}

interface SocialServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  service?: SocialService | null
  categories: SocialCategory[]
}

const serviceTypeOptions = [
  { value: "followers", label: "Followers" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
  { value: "views", label: "Views" },
  { value: "subscribers", label: "Subscribers" },
  { value: "shares", label: "Shares" },
]

export function SocialServiceForm({ isOpen, onClose, onSuccess, service, categories }: SocialServiceFormProps) {
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    service_type: "",
    service_mode: "custom",
    price_user: "",
    price_reseller: "",
    min_order: "1",
    max_order: "10000",
    features: [] as string[],
    status: "active",
  })
  const [newFeature, setNewFeature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (service) {
      setFormData({
        category_id: service.category_id.toString(),
        name: service.name,
        description: service.description || "",
        service_type: service.service_type,
        service_mode: service.service_mode || "custom",
        price_user: service.price_user.toString(),
        price_reseller: service.price_reseller.toString(),
        min_order: service.min_order.toString(),
        max_order: service.max_order.toString(),
        features: service.features || [],
        status: service.status,
      })
    } else {
      setFormData({
        category_id: "",
        name: "",
        description: "",
        service_type: "",
        service_mode: "custom",
        price_user: "",
        price_reseller: "",
        min_order: "1",
        max_order: "10000",
        features: [],
        status: "active",
      })
    }
  }, [service])

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        category_id: Number.parseInt(formData.category_id),
        price_user: Number.parseFloat(formData.price_user),
        price_reseller: Number.parseFloat(formData.price_reseller),
        min_order: Number.parseInt(formData.min_order),
        max_order: Number.parseInt(formData.max_order),
        service_mode: formData.service_mode,
      }

      const url = service ? `/api/admin/social-services/${service.id}` : "/api/admin/social-services"
      const method = service ? "PUT" : "POST"

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
        alert(error.error || "Failed to save service")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to save service")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Service Mode *</Label>
            <RadioGroup
              value={formData.service_mode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, service_mode: value }))}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="mode-custom" />
                <Label htmlFor="mode-custom">Custom (Manual Input)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="package" id="mode-package" />
                <Label htmlFor="mode-package">Package (Predefined Packages)</Label>
              </div>
            </RadioGroup>
            <div className="text-xs text-gray-500 mt-1">
              Custom: Users input quantity manually. Package: Users choose from predefined packages.
            </div>
          </div>

          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Instagram Followers - High Quality"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the service..."
              rows={3}
            />
          </div>

          {/* PRICING SECTION - Admin inputs both user and reseller prices */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-blue-900">Pricing Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_user" className="text-blue-800">
                  User Price (IDR) *
                </Label>
                <Input
                  id="price_user"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_user}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price_user: e.target.value }))}
                  placeholder="1000"
                  required
                  className="border-blue-200"
                />
                <div className="text-xs text-blue-600 mt-1">
                  {formData.service_mode === "custom"
                    ? "Harga per 1000 untuk user biasa"
                    : "Harga base untuk user biasa"}
                </div>
              </div>

              <div>
                <Label htmlFor="price_reseller" className="text-blue-800">
                  Reseller Price (IDR) *
                </Label>
                <Input
                  id="price_reseller"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_reseller}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price_reseller: e.target.value }))}
                  placeholder="800"
                  required
                  className="border-blue-200"
                />
                <div className="text-xs text-blue-600 mt-1">
                  {formData.service_mode === "custom" ? "Harga per 1000 untuk reseller" : "Harga base untuk reseller"}
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
              💡 Tip: Harga reseller biasanya 10-20% lebih murah dari harga user untuk memberikan margin keuntungan
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_order">Min Order *</Label>
              <Input
                id="min_order"
                type="number"
                min="1"
                value={formData.min_order}
                onChange={(e) => setFormData((prev) => ({ ...prev, min_order: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="max_order">Max Order *</Label>
              <Input
                id="max_order"
                type="number"
                min="1"
                value={formData.max_order}
                onChange={(e) => setFormData((prev) => ({ ...prev, max_order: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Features</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button type="button" onClick={() => removeFeature(feature)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
            >
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : service ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
