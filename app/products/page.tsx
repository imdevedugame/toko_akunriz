"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, ShoppingCart, Star, Crown, Package, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams, useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  slug: string
  description: string
  category_name: string
  category_slug: string
  user_price: number
  reseller_price: number
  stock: number
  images: string[]
  rating?: number
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
  product_count: number
}

const categoryColors = {
  Netflix: "from-red-500 to-red-600",
  "Disney+": "from-blue-500 to-blue-600",
  Spotify: "from-green-500 to-green-600",
  YouTube: "from-red-600 to-red-700",
  Instagram: "from-purple-500 to-pink-500",
  TikTok: "from-black to-gray-800",
  default: "from-amber-500 to-orange-600",
}

export default function ProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Get initial values from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const itemsPerPage = 12

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
    updateURL()
  }, [selectedCategory, sortBy, currentPage])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchTerm !== searchParams.get("search")) {
        setCurrentPage(1)
        fetchProducts()
        updateURL()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (sortBy !== "newest") params.set("sort", sortBy)

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ""}`
    router.replace(newURL, { scroll: false })
  }

  const fetchProducts = async () => {
    try {
      setIsSearching(true)
      const params = new URLSearchParams()
      params.append("limit", itemsPerPage.toString())
      params.append("offset", ((currentPage - 1) * itemsPerPage).toString())

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        let sortedProducts = data.products || []

        // Client-side sorting
        sortedProducts = sortedProducts.sort((a: Product, b: Product) => {
          switch (sortBy) {
            case "price-low":
              return getPrice(a) - getPrice(b)
            case "price-high":
              return getPrice(b) - getPrice(a)
            case "name":
              return a.name.localeCompare(b.name)
            case "stock":
              return b.stock - a.stock
            case "rating":
              return (b.rating || 4.5) - (a.rating || 4.5)
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
        })

        setProducts(sortedProducts)
        setTotalProducts(data.pagination?.total || sortedProducts.length)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?include_count=true")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPrice = (product: Product) => {
    return user?.role === "reseller" ? product.reseller_price : product.user_price
  }

  const getDiscountPercentage = (product: Product) => {
    if (user?.role === "reseller") {
      const discount = ((product.user_price - product.reseller_price) / product.user_price) * 100
      return Math.round(discount)
    }
    return 0
  }

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Habis", color: "bg-red-500", icon: Package }
    if (stock < 10) return { text: "Terbatas", color: "bg-orange-500", icon: Package }
    return { text: "Tersedia", color: "bg-green-500", icon: Package }
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mb-6 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardContent className="p-0">
                  <Skeleton className="h-32 sm:h-40 w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile-First Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
            {selectedCategory === "all"
              ? "Semua Produk"
              : categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
          </h1>
          <p className="text-sm text-gray-600">
            {searchTerm ? `Hasil pencarian "${searchTerm}"` : "Pilih produk terbaik dengan harga terjangkau"}
          </p>
        </div>

        {/* Mobile Categories - Horizontal Scroll */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect("all")}
              className={`flex-shrink-0 text-xs ${
                selectedCategory === "all" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              Semua
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category.slug)}
                className={`flex-shrink-0 text-xs ${
                  selectedCategory === category.slug
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-amber-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                    </div>
                  )}
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 h-10 border-gray-200">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="name">Nama A-Z</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                    <SelectItem value="stock">Stok Terbanyak</SelectItem>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Package className="h-3 w-3" />
                  <span>
                    {products.length} dari {totalProducts} produk
                  </span>
                </div>
                {user?.role === "reseller" && (
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Reseller
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid - Shopee Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock)
            return (
              <Card
                key={product.id}
                className="group hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white border border-gray-200"
              >
                <CardContent className="p-0">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative">
                      <Image
                        src={product.images[0] || "/placeholder.svg?height=160&width=160"}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Stock Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`${stockStatus.color} text-white text-xs px-2 py-1`}>
                          {stockStatus.text}
                        </Badge>
                      </div>

                      {/* Discount Badge */}
                      {user?.role === "reseller" && getDiscountPercentage(product) > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                            -{getDiscountPercentage(product)}%
                          </Badge>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleFavorite(product.id)
                        }}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3">
                      {/* Category */}
                      <Badge
                        className={`bg-gradient-to-r ${getCategoryColor(product.category_name)} text-white text-xs px-2 py-1 mb-2`}
                      >
                        {product.category_name}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 text-gray-900 leading-tight">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || 4.5)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">({product.rating || 4.5})</span>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="text-lg font-bold text-amber-600">{formatPrice(getPrice(product))}</div>
                        {user?.role === "reseller" && (
                          <div className="text-xs text-gray-500 line-through">{formatPrice(product.user_price)}</div>
                        )}
                      </div>

                      {/* Stock Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-600">Stok: {product.stock}</div>
                        {product.stock > 0 && product.stock < 50 && (
                          <div className="text-xs text-orange-600 font-medium">Terlaris</div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        disabled={product.stock === 0}
                        className={`w-full text-xs font-medium ${
                          product.stock === 0
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {product.stock === 0 ? (
                          <>
                            <Package className="h-3 w-3 mr-1" />
                            Habis
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Beli
                          </>
                        )}
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-auto shadow-sm">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Produk Tidak Ditemukan" : "Belum Ada Produk"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchTerm ? "Coba ubah kata kunci pencarian atau kategori" : "Produk akan segera tersedia"}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mobile-Friendly Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(3, totalPages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-gray-200"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <>
                    <span className="text-gray-500 px-1">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="border-gray-200"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
