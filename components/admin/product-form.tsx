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
import { X, Upload, Plus } from "lucide-react"
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
  stock: number
  features: string[]
  tips: string[]
  images: string[]
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
    stock: 0,
    features: [],
    tips: [],
    images: [],
  })
  const [newFeature, setNewFeature] = useState("")
  const [newTip, setNewTip] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (product) {
      setFormData(product)
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

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card className="bg-white">
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
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card className="bg-white">
        <CardHeader>
        <CardTitle>Pricing & Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user_price">User Price (IDR) *</Label>
          <Input
          id="user_price"
          type="number"
          value={formData.user_price}
          onChange={(e) => setFormData({ ...formData, user_price: Number.parseFloat(e.target.value) || 0 })}
          placeholder="25000"
          required
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
          />
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
          />
        </div>
        </CardContent>
      </Card>
      </div>

      {/* Images */}
      <Card className="bg-white">
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
      <Card className="bg-white">
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
      <Card className="bg-white">
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
