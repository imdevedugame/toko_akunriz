"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, Package, DollarSign, Users, CheckCircle, XCircle, AlertTriangle, Search, Filter, Eye, EyeOff, Info } from 'lucide-react'

interface Product {
  id: number
  name: string
  slug: string
  category_name: string
  user_price: number
  reseller_price: number
  stock: number
  status: string
  description?: string
  created_at: string
}

interface AccountFormProps {
  onSuccess: () => void
  onCancel: () => void
  editAccount?: {
    id: number
    product_id: number
    email: string
    password: string
    description: string
  } | null
}

export default function AccountForm({ onSuccess, onCancel, editAccount }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [showInactiveProducts, setShowInactiveProducts] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    product_id: "",
    email: "",
    password: "",
    description: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (editAccount) {
      setFormData({
        product_id: editAccount.product_id.toString(),
        email: editAccount.email,
        password: editAccount.password,
        description: editAccount.description || "",
      })
      
      // Find and set the selected product
      const product = products.find(p => p.id === editAccount.product_id)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [editAccount, products])

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true)
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
        description: "Gagal memuat daftar produk",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category_name))]
    return uniqueCategories.sort()
  }, [products])

  // Filter products based on search, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                           product.category_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                           product.slug.toLowerCase().includes(productSearch.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || product.category_name === selectedCategory
      
      const matchesStatus = showInactiveProducts || product.status === 'active'
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, productSearch, selectedCategory, showInactiveProducts])

  // Group products by category for better organization
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {}
    filteredProducts.forEach(product => {
      if (!groups[product.category_name]) {
        groups[product.category_name] = []
      }
      groups[product.category_name].push(product)
    })
    return groups
  }, [filteredProducts])

  const handleProductChange = (productId: string) => {
    setFormData({ ...formData, product_id: productId })
    const product = products.find(p => p.id.toString() === productId)
    setSelectedProduct(product || null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getProductStatusInfo = (product: Product) => {
    if (product.status !== 'active') {
      return {
        canAdd: false,
        reason: "Produk sedang tidak aktif",
        color: "text-red-600",
        icon: XCircle
      }
    }
    
    if (product.stock <= 0) {
      return {
        canAdd: false,
        reason: "Stok produk habis",
        color: "text-orange-600",
        icon: AlertTriangle
      }
    }
    
    return {
      canAdd: true,
      reason: "Produk tersedia untuk ditambahkan",
      color: "text-green-600",
      icon: CheckCircle
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.product_id || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Validate selected product
    if (selectedProduct) {
      const statusInfo = getProductStatusInfo(selectedProduct)
      if (!statusInfo.canAdd) {
        toast({
          title: "Error",
          description: `Tidak dapat menambahkan akun: ${statusInfo.reason}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const url = editAccount ? `/api/admin/accounts/${editAccount.id}` : "/api/admin/accounts"
      const method = editAccount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: parseInt(formData.product_id),
          email: formData.email,
          password: formData.password,
          description: formData.description,
        }),
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editAccount ? "Akun berhasil diperbarui" : "Akun berhasil ditambahkan",
        })
        onSuccess()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save account")
      }
    } catch (error) {
      console.error("Failed to save account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan akun",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {editAccount ? "Edit Akun" : "Tambah Akun Baru"}
        </h2>
        <p className="text-gray-600">
          {editAccount ? "Perbarui informasi akun" : "Tambahkan akun premium baru ke inventori"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Product Selection */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  Pilih Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cari Produk</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari nama produk..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Filter Status</Label>
                    <Button
                      type="button"
                      variant={showInactiveProducts ? "default" : "outline"}
                      onClick={() => setShowInactiveProducts(!showInactiveProducts)}
                      className="w-full justify-start bg-blue-200 hover:bg-gray-200 "
                    >
                      {showInactiveProducts ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                      {showInactiveProducts ? "Semua Produk" : "Hanya Aktif"}
                    </Button>
                  </div>
                </div>

                {/* Product Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-600 text-lg">{products.length}</div>
                    <div className="text-blue-700 text-xs">Total Produk</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-600 text-lg">
                      {products.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-green-700 text-xs">Produk Aktif</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-600 text-lg">
                      {products.filter(p => p.stock <= 0).length}
                    </div>
                    <div className="text-orange-700 text-xs">Stok Habis</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-600 text-lg">{filteredProducts.length}</div>
                    <div className="text-purple-700 text-xs">Hasil Filter</div>
                  </div>
                </div>

                {/* Product Selection Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="product_id" className="text-sm font-medium">Produk *</Label>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center p-8 border rounded-lg">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Memuat produk...</span>
                    </div>
                  ) : (
                    <Select value={formData.product_id} onValueChange={handleProductChange}>
                      <SelectTrigger className="bg-white hover:bg-gray-50">
                        <SelectValue placeholder="Pilih produk untuk akun ini" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <ScrollArea className="h-[300px]">
                          {Object.keys(groupedProducts).length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>Tidak ada produk ditemukan</p>
                              <p className="text-xs mt-1">Coba ubah filter pencarian</p>
                            </div>
                          ) : (
                            Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                                  {category} ({categoryProducts.length})
                                </div>
                                {categoryProducts.map((product) => {
                                  const statusInfo = getProductStatusInfo(product)
                                  const StatusIcon = statusInfo.icon
                                  
                                  return (
                                    <SelectItem 
                                      key={product.id} 
                                      value={product.id.toString()}
                                      disabled={!statusInfo.canAdd}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{product.name}</span>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                                              <Badge 
                                                variant={product.status === 'active' ? 'default' : 'secondary'}
                                                className={`text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                              >
                                                {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                              </Badge>
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                            <span>Stok: {product.stock}</span>
                                            <span>{formatCurrency(product.user_price)}</span>
                                            {!statusInfo.canAdd && (
                                              <span className={`font-medium ${statusInfo.color}`}>
                                                {statusInfo.reason}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                                <Separator className="my-1" />
                              </div>
                            ))
                          )}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Account Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  Detail Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Akun *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password Akun *</Label>
                    <Input
                      id="password"
                      type="text"
                      placeholder="Password akun"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Catatan Tambahan</Label>
                    <Textarea
                      id="description"
                      placeholder="Catatan atau informasi tambahan tentang akun ini..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Product Preview - Full Width */}
        {selectedProduct && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Produk Terpilih: {selectedProduct.name}
                </CardTitle>
                {(() => {
                  const statusInfo = getProductStatusInfo(selectedProduct)
                  const StatusIcon = statusInfo.icon
                  return (
                    <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{statusInfo.reason}</span>
                    </div>
                  )
                })()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Informasi Produk</Label>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm">{selectedProduct.category_name}</p>
                    <Badge 
                      variant={selectedProduct.status === 'active' ? 'default' : 'secondary'}
                      className={selectedProduct.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {selectedProduct.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Harga User</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">
                      {formatCurrency(selectedProduct.user_price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Harga Reseller</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-600 text-lg">
                      {formatCurrency(selectedProduct.reseller_price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Stok Tersedia</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className={`font-semibold text-lg ${selectedProduct.stock <= 0 ? 'text-red-600' : 'text-purple-600'}`}>
                      {selectedProduct.stock} akun
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              <div className="mt-6">
                {(() => {
                  const statusInfo = getProductStatusInfo(selectedProduct)
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <Alert className={`border-l-4 ${
                      statusInfo.canAdd 
                        ? 'border-l-green-500 bg-green-50' 
                        : 'border-l-red-500 bg-red-50'
                    }`}>
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      <AlertDescription className={`${statusInfo.color} font-medium`}>
                        {statusInfo.reason}
                      </AlertDescription>
                    </Alert>
                  )
                })()}
              </div>

              {/* Product Description */}
              {selectedProduct.description && (
                <div className="mt-6 pt-4 border-t">
                  <Label className="text-sm font-medium text-gray-600">Deskripsi Produk</Label>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Full Width */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isLoading || (selectedProduct && !getProductStatusInfo(selectedProduct).canAdd)} 
            className="flex-1 h-12 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editAccount ? "Perbarui Akun" : "Tambah Akun"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 h-12 text-base font-medium bg-white hover:bg-gray-50"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  )
}
