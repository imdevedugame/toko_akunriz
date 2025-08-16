"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Crown,
  Package,
  Heart,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  Timer,
  ImageOff,
} from "lucide-react"
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
  fake_price?: number
  stock: number
  images: string[]
  rating?: number
  created_at: string
  is_flash_sale?: boolean
  is_flash_sale_active?: boolean
  flash_sale_price?: number
  flash_sale_discount_percent?: number
  flash_sale_end?: string
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
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Get initial values from URL params - Changed default sort to price-low
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "price-low")
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

  useEffect(() => {
    // Check scroll position for category buttons
    checkScrollButtons()
  }, [categories])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (sortBy !== "price-low") params.set("sort", sortBy)

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ""}`
    router.replace(newURL, { scroll: false })
  }

  const checkScrollButtons = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200
      const newScrollLeft =
        direction === "left"
          ? categoryScrollRef.current.scrollLeft - scrollAmount
          : categoryScrollRef.current.scrollLeft + scrollAmount

      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })

      // Update button states after scroll
      setTimeout(checkScrollButtons, 300)
    }
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
    if (product.is_flash_sale_active && product.flash_sale_price) {
      return user?.role === "reseller" ? product.reseller_price : product.flash_sale_price
    }
    return user?.role === "reseller" ? product.reseller_price : product.user_price
  }

  const getOriginalPrice = (product: Product) => {
    if (product.is_flash_sale_active) {
      return product.user_price
    }
    if (product.fake_price && product.fake_price > product.user_price) {
      return product.fake_price
    }
    return user?.role === "reseller" ? product.user_price : null
  }

  const getDiscountPercentage = (product: Product) => {
    if (product.is_flash_sale_active && product.flash_sale_discount_percent) {
      return product.flash_sale_discount_percent
    }
    if (product.fake_price && product.fake_price > product.user_price) {
      return Math.round(((product.fake_price - product.user_price) / product.fake_price) * 100)
    }
    if (user?.role === "reseller") {
      return Math.round(((product.user_price - product.reseller_price) / product.user_price) * 100)
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
    if (stock === 0) return { text: "Habis", color: "bg-gradient-to-r from-red-500 to-red-600", icon: Package }
    if (stock < 10) return { text: "Terbatas", color: "bg-gradient-to-r from-orange-500 to-amber-500", icon: Clock }
    return { text: "Tersedia", color: "bg-gradient-to-r from-green-500 to-emerald-500", icon: Package }
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const distance = end - now

    if (distance < 0) return null

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}j ${minutes}m`
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(itemsPerPage)].map((_, i) => (
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

        {/* Enhanced Categories with Navigation Arrows */}
        <div className="mb-4">
          <div className="relative">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="sm"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md border-gray-200 ${
                !canScrollLeft ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
              onClick={() => scrollCategories("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Categories Container */}
            <div className="mx-10">
              <div
                ref={categoryScrollRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                onScroll={checkScrollButtons}
              >
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect("all")}
                  className={`flex-shrink-0 text-xs ${
                    selectedCategory === "all"
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-white hover:bg-gray-50"
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

            {/* Right Arrow */}
            <Button
              variant="outline"
              size="sm"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md border-gray-200 ${
                !canScrollRight ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
              onClick={() => scrollCategories("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
                  <SelectContent className="bg-white">
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="name">Nama A-Z</SelectItem>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product, index) => {
            const stockStatus = getStockStatus(product.stock)
            const StockIcon = stockStatus.icon
            const originalPrice = getOriginalPrice(product)
            const currentPrice = getPrice(product)
            const discountPercent = getDiscountPercentage(product)
            const timeRemaining = product.flash_sale_end ? getTimeRemaining(product.flash_sale_end) : null

            return (
              <Card
                key={product.id}
                className="group hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-500 sm:duration-700 overflow-hidden border-0 shadow-md sm:shadow-lg lg:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-4 bg-white/95 backdrop-blur-sm relative hover:rotate-0 sm:hover:rotate-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={240}
                        height={160}
                        className="w-full h-32 sm:h-40 lg:h-48 object-cover transition-all duration-500 sm:duration-700 group-hover:scale-105 sm:group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-32 sm:h-40 lg:h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                        <ImageOff className="w-16 h-16" />
                      </div>
                    )}

                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500"></div>

                    {/* Floating Background Elements */}
                    <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-xl sm:blur-2xl group-hover:scale-125 sm:group-hover:scale-150 transition-transform duration-500 sm:duration-700"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-col gap-1 sm:gap-2 lg:gap-3">
                      {product.is_flash_sale_active ? (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-xs animate-pulse group-hover:animate-none">
                          <Zap className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">FLASH SALE</span>
                          <span className="sm:hidden">⚡</span>
                        </Badge>
                      ) : null}

                      <Badge
                        className={`${stockStatus.color} text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-xs`}
                      >
                        <StockIcon className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                        {stockStatus.text}
                      </Badge>
                    </div>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                        <Badge
                          className={`text-white font-bold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-xs ${
                            product.is_flash_sale_active
                              ? "bg-gradient-to-r from-red-500 to-red-600 animate-bounce"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                          }`}
                        >
                          <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />-{discountPercent}%
                        </Badge>
                      </div>
                    )}

                    {/* Flash Sale Timer */}
                    {product.is_flash_sale_active && product.flash_sale_end && timeRemaining ? (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center animate-pulse">
                          <Timer className="w-3 h-3 mr-1" />
                          Berakhir dalam {timeRemaining}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Enhanced Product Info */}
                  <div className="p-3 sm:p-3 md:p-4 relative">
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Badge
                        className={`bg-gradient-to-r ${getCategoryColor(
                          product.category_name,
                        )} text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg text-xs sm:text-xs`}
                      >
                        {product.category_name}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 ${
                                i < Math.floor(product.rating || 4.5)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-xs text-gray-600 font-medium">{product.rating || 4.5}</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-sm sm:text-base md:text-base mb-2 sm:mb-3 line-clamp-2 group-hover:text-amber-700 transition-colors leading-tight">
                      {product.name}
                    </h3>

                    {/* Description - Hidden on mobile */}
                    <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm hidden sm:block">
                      {product.description}
                    </p>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center text-xs sm:text-xs text-gray-500 bg-gray-50 px-2 py-1 sm:px-3 sm:py-2 rounded-full">
                        <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Stok: </span>
                        <span className="font-semibold ml-1 text-gray-700">{product.stock}</span>
                      </div>
                      {product.stock > 0 && product.stock < 50 && (
                        <div className="flex items-center text-xs sm:text-xs text-orange-600 bg-orange-100 px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Terlaris</span>
                          <span className="sm:hidden">🔥</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Pricing */}
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-end justify-between">
                        <div>
                          {originalPrice && (
                            <div className="text-xs sm:text-xs text-gray-500 line-through font-medium mb-1">
                              {formatPrice(originalPrice)}
                            </div>
                          )}
                          <div
                            className={`text-base sm:text-lg md:text-xl font-bold ${
                              product.is_flash_sale_active
                                ? "bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"
                                : "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                            }`}
                          >
                            {formatPrice(currentPrice)}
                          </div>
                        </div>
                        {discountPercent > 0 && (
                          <Badge
                            className={`text-xs ${
                              product.is_flash_sale_active ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            Hemat {discountPercent}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Action Button */}
                    <Button
                      asChild
                      className={`w-full font-bold text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 transition-all duration-300 sm:duration-500 transform hover:scale-105 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl ${
                        product.stock === 0
                          ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
                          : product.is_flash_sale_active
                            ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                            : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                      }`}
                      disabled={product.stock === 0}
                    >
                      <Link href={`/product/${product.id}`} className="flex items-center justify-center">
                        {product.stock === 0 ? (
                          <>
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Stok Habis</span>
                            <span className="sm:hidden">Habis</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">
                              {product.is_flash_sale_active ? "Beli Flash Sale!" : "Beli Sekarang"}
                            </span>
                            <span className="sm:hidden">{product.is_flash_sale_active ? "Flash!" : "Beli"}</span>
                          </>
                        )}
                      </Link>
                    </Button>

                    {/* Mobile Favorite Button - Kept for functionality, can be removed if not desired */}
                    <div className="mt-2 sm:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`w-full transition-all duration-300 ${
                          favorites.has(product.id)
                            ? "text-red-500 border-red-300 hover:bg-red-50"
                            : "text-gray-600 hover:text-red-500 border-gray-300"
                        }`}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${favorites.has(product.id) ? "fill-current" : ""}`} />
                        {favorites.has(product.id) ? "Favorit" : "Tambah Favorit"}
                      </Button>
                    </div>

                    {/* Enhanced Trust Indicator - Hidden on mobile */}
                    {product.stock > 0 && (
                      <div className="mt-3 sm:mt-4 text-center hidden sm:block">
                        <span className="text-xs sm:text-xs text-gray-500 flex items-center justify-center bg-gray-50 px-3 py-2 rounded-full">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500" />
                          <span className="hidden lg:inline">Garansi 100% atau uang kembali</span>
                          <span className="lg:hidden">Garansi 100%</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-600/5 via-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500 pointer-events-none"></div>
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
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
