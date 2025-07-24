"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Upload, Plus, Calendar, Percent } from "lucide-react"
import Image from "next/image"

interface Category {
  id: number
  name: string
  slug: string
}

interface Product {
  id?: number
  name: string
  slug: string
  description: string
  category_id: number
  user_price: number
  reseller_price: number
  fake_price?: number
  stock: number
  features: string[]
  tips: string[]
  images: string[]
  featured?: boolean
  status?: string
  is_flash_sale?: boolean
  flash_sale_start?: string
  flash_sale_end?: string
  flash_sale_discount_percent?: number
}

interface ProductFormProps {
  product?: Product
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<Product>({
    name: "",
    slug: "",
    description: "",
    category_id: 0,
    user_price: 0,
    reseller_price: 0,
    fake_price: 0,
    stock: 0,
    features: [],
    tips: [],
    images: [],
    featured: false,
    status: "active",
    is_flash_sale: false,
    flash_sale_start: "",
    flash_sale_end: "",
    flash_sale_discount_percent: 0,
  })
  const [newFeature, setNewFeature] = useState("")
  const [newTip, setNewTip] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (product) {
      setFormData({
        ...product,
        featured: product.featured || false,
        status: product.status || "active",
        is_flash_sale: product.is_flash_sale || false,
        fake_price: product.fake_price || 0,
        flash_sale_start: product.flash_sale_start ? new Date(product.flash_sale_start).toISOString().slice(0, 16) : "",
        flash_sale_end: product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().slice(0, 16) : "",
        flash_sale_discount_percent: product.flash_sale_discount_percent || 0,
      })
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleUserPriceChange = (price: number) => {
    setFormData({
      ...formData,
      user_price: price,
      // Auto-generate fake price (30-50% higher)
      fake_price: Math.round(price * (1.3 + Math.random() * 0.2)),
    })
  }

  const calculateFlashSalePrice = () => {
    if ((formData.flash_sale_discount_percent ?? 0) > 0 && formData.user_price > 0) {
      return Math.round(formData.user_price * (1 - (formData.flash_sale_discount_percent ?? 0) / 100))
    }
    return formData.user_price
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (formData.images.length + files.length > 5) {
      alert("Maximum 5 images allowed")
      return
    }

    setIsUploading(true)

    try {
      const formDataUpload = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append("files", files[i])
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          ...formData,
          images: [...formData.images, ...data.files],
        })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to upload images")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload images")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  const addTip = () => {
    if (newTip.trim()) {
      setFormData({
        ...formData,
        tips: [...formData.tips, newTip.trim()],
      })
      setNewTip("")
    }
  }

  const removeTip = (index: number) => {
    const newTips = formData.tips.filter((_, i) => i !== index)
    setFormData({ ...formData, tips: newTips })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.category_id) {
      alert("Please fill in all required fields")
      return
    }

    if (formData.user_price <= 0 || formData.reseller_price <= 0) {
      alert("Prices must be greater than 0")
      return
    }

    if (formData.reseller_price >= formData.user_price) {
      alert("Reseller price must be less than user price")
      return
    }

    if ((formData.fake_price ?? 0) > 0 && (formData.fake_price ?? 0) <= formData.user_price) {
      alert("Fake price must be higher than user price")
      return
    }

    if (formData.is_flash_sale) {
      if (!formData.flash_sale_start || !formData.flash_sale_end) {
        alert("Please set flash sale start and end dates")
        return
      }
      if (new Date(formData.flash_sale_start) >= new Date(formData.flash_sale_end)) {
        alert("Flash sale end date must be after start date")
        return
      }
      if ((formData.flash_sale_discount_percent ?? 0) <= 0 || (formData.flash_sale_discount_percent ?? 0) >= 100) {
        alert("Flash sale discount must be between 1-99%")
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Netflix Premium 1 Bulan"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, category_id: Number.parseInt(value) })}
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the product..."
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fake_price">Fake Price (Crossed Out) *</Label>
              <Input
                id="fake_price"
                type="number"
                value={formData.fake_price}
                onChange={(e) => setFormData({ ...formData, fake_price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="35000"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">Price to show crossed out (should be higher than user price)</p>
            </div>

            <div>
              <Label htmlFor="user_price">User Price (IDR) *</Label>
              <Input
                id="user_price"
                type="number"
                value={formData.user_price}
                onChange={(e) => handleUserPriceChange(Number.parseFloat(e.target.value) || 0)}
                placeholder="25000"
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="reseller_price">Reseller Price (IDR) *</Label>
              <Input
                id="reseller_price"
                type="number"
                value={formData.reseller_price}
                onChange={(e) => setFormData({ ...formData, reseller_price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="20000"
                required
                min="0"
              />
              {formData.user_price > 0 && formData.reseller_price > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Discount: {Math.round(((formData.user_price - formData.reseller_price) / formData.user_price) * 100)}%
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                placeholder="50"
                required
                min="0"
              />
            </div>

            {/* Price Preview */}
            {formData.fake_price !== undefined && formData.fake_price > 0 && formData.user_price > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Price Preview:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-gray-500 line-through">{formatCurrency(formData.fake_price)}</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(formData.user_price)}</span>
                  <Badge className="bg-red-500">
                    -{Math.round(((formData.fake_price - formData.user_price) / formData.fake_price) * 100)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flash Sale Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Flash Sale Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_flash_sale"
              checked={formData.is_flash_sale}
              onCheckedChange={(checked) => setFormData({ ...formData, is_flash_sale: checked })}
            />
            <Label htmlFor="is_flash_sale">Enable Flash Sale</Label>
          </div>

          {formData.is_flash_sale && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
              <div>
                <Label htmlFor="flash_sale_start">Start Date & Time *</Label>
                <Input
                  id="flash_sale_start"
                  type="datetime-local"
                  value={formData.flash_sale_start}
                  onChange={(e) => setFormData({ ...formData, flash_sale_start: e.target.value })}
                  required={formData.is_flash_sale}
                />
              </div>

              <div>
                <Label htmlFor="flash_sale_end">End Date & Time *</Label>
                <Input
                  id="flash_sale_end"
                  type="datetime-local"
                  value={formData.flash_sale_end}
                  onChange={(e) => setFormData({ ...formData, flash_sale_end: e.target.value })}
                  required={formData.is_flash_sale}
                />
              </div>

              <div>
                <Label htmlFor="flash_sale_discount_percent">Discount Percentage *</Label>
                <div className="relative">
                  <Input
                    id="flash_sale_discount_percent"
                    type="number"
                    value={formData.flash_sale_discount_percent}
                    onChange={(e) =>
                      setFormData({ ...formData, flash_sale_discount_percent: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="20"
                    min="1"
                    max="99"
                    required={formData.is_flash_sale}
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {(formData.flash_sale_discount_percent ?? 0) > 0 && (
                <div className="md:col-span-3 p-3 bg-white rounded border">
                  <Label className="text-sm font-medium">Flash Sale Price Preview:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg text-gray-500 line-through">{formatCurrency(formData.user_price)}</span>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(calculateFlashSalePrice())}</span>
                    <Badge className="bg-red-500">FLASH SALE -{formData.flash_sale_discount_percent}%</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images (Max 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {formData.images.length < 5 && (
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>

            {isUploading && <div className="text-center text-sm text-gray-500">Uploading images...</div>}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Product Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
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

          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFeature(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="Add a usage tip..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTip())}
            />
            <Button type="button" onClick={addTip}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{tip}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTip(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
