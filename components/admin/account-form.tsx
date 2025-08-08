"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Package } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  slug: string
  category_name: string
  price: number
  stock: number
  is_active: boolean
}

interface AccountFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AccountForm({ onSuccess, onCancel }: AccountFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [formData, setFormData] = useState({
    product_id: "",
    email: "",
    password: "",
    additional_info: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.product_id || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: parseInt(formData.product_id),
          email: formData.email,
          password: formData.password,
          additional_info: formData.additional_info || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      toast({
        title: "Success",
        description: "Account created successfully.",
      })

      onSuccess()
    } catch (error) {
      console.error("Create account error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedProduct = products.find(p => p.id.toString() === formData.product_id)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Akun Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product_id">
              Produk <span className="text-red-500">*</span>
            </Label>
            {isLoadingProducts ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading products...
              </div>
            ) : (
              <Select value={formData.product_id} onValueChange={(value) => handleInputChange("product_id", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk untuk akun ini" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <ScrollArea className="h-[200px]">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-gray-500">{product.category_name}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="flex items-center justify-center p-4 text-gray-500">
                        <Package className="h-4 w-4 mr-2" />
                        No products available
                      </div>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
            
            {/* Selected Product Info */}
            {selectedProduct && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedProduct.name}</p>
                    <p className="text-sm text-blue-700">{selectedProduct.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-900">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(selectedProduct.price)}
                    </p>
                    <p className="text-sm text-blue-700">Stock: {selectedProduct.stock}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="account@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="text"
              placeholder="Account password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional Information</Label>
            <Textarea
              id="additional_info"
              placeholder="Any additional information about this account (optional)"
              value={formData.additional_info}
              onChange={(e) => handleInputChange("additional_info", e.target.value)}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
