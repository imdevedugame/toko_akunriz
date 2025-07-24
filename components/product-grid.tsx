"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  ShoppingCart,
  Eye,
  Heart,
  Zap,
  Crown,
  TrendingUp,
  Shield,
  Clock,
  Package,
  Sparkles,
  Timer,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider" // Assuming this exists for user role

interface Product {
  id: number
  name: string
  slug: string
  description: string
  category_name: string
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

interface ProductGridProps {
  limit?: number
  category?: string
  featured?: boolean
}

export function ProductGrid({ limit = 8, category, featured = false }: ProductGridProps) {
  const { user } = useAuth() // Assuming useAuth provides user and role
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchProducts()
  }, [limit, category, featured])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.append("limit", limit.toString())
      params.append("offset", "0")
      if (category) {
        params.append("category", category)
      }
      if (featured) {
        params.append("featured", "true")
      }
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to fetch products: ${response.status} ${response.statusText} - ${errorText}`)
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Gagal memuat produk. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
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
    // If flash sale is active, show flash sale price
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
    const colors = {
      Netflix: "from-red-500 to-red-600",
      "Disney+": "from-blue-500 to-blue-600",
      Spotify: "from-green-500 to-green-600",
      YouTube: "from-red-600 to-red-700",
      Instagram: "from-purple-500 to-pink-500",
      TikTok: "from-black to-gray-800",
      default: "from-amber-500 to-orange-600",
    }
    return colors[category as keyof typeof colors] || colors.default
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-md bg-white/90 backdrop-blur-sm animate-pulse">
              <CardContent className="p-0">
                <Skeleton className="h-32 sm:h-40 lg:h-48 w-full bg-gradient-to-r from-amber-100 to-orange-100" />
                <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 sm:h-4 lg:h-5 w-16 sm:w-20 bg-amber-200" />
                    <Skeleton className="h-3 sm:h-4 lg:h-5 w-12 sm:w-16 bg-orange-200" />
                  </div>
                  <Skeleton className="h-4 sm:h-5 lg:h-6 w-full bg-amber-100" />
                  <Skeleton className="h-3 sm:h-4 w-3/4 bg-orange-100" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-amber-200" />
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 bg-orange-200" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 sm:h-6 lg:h-7 w-20 sm:w-28 bg-amber-200" />
                    <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 bg-orange-200" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 lg:h-12 w-full bg-gradient-to-r from-amber-200 to-orange-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto shadow-lg sm:shadow-xl border-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Oops! Terjadi Kesalahan
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">{error}</p>
            <Button
              onClick={fetchProducts}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto shadow-lg sm:shadow-xl border-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Belum Ada Produk</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Produk akan segera tersedia. Pantau terus untuk update terbaru!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product, index) => {
          const stockStatus = getStockStatus(product.stock)
          const StockIcon = stockStatus.icon
          const originalPrice = getOriginalPrice(product)
          const currentPrice = getPrice(product)
          const discountPercent = getDiscountPercentage(product)
          return (
            <Card
              key={product.id}
              className="group hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-500 sm:duration-700 overflow-hidden border-0 shadow-md sm:shadow-lg lg:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-4 bg-white/95 backdrop-blur-sm relative hover:rotate-0 sm:hover:rotate-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=160&width=240"}
                    alt={product.name}
                    width={240}
                    height={160}
                    className="w-full h-32 sm:h-40 lg:h-48 object-cover transition-all duration-500 sm:duration-700 group-hover:scale-105 sm:group-hover:scale-110"
                  />
                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500"></div>
                  {/* Floating Background Elements */}
                  <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-xl sm:blur-2xl group-hover:scale-125 sm:group-hover:scale-150 transition-transform duration-500 sm:duration-700"></div>
                  {/* Top Badges */}
                  <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-col gap-1 sm:gap-2 lg:gap-3">
                    {product.is_flash_sale_active ? (
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-sm animate-pulse group-hover:animate-none">
                      <Zap className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">FLASH SALE</span>
                      <span className="sm:hidden">⚡</span>
                      </Badge>
                    ) : null}
                    {featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-sm animate-pulse group-hover:animate-none">
                        <Crown className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Featured</span>
                        <span className="sm:hidden">★</span>
                      </Badge>
                    )}
                    <Badge
                      className={`${stockStatus.color} text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-sm`}
                    >
                      <StockIcon className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                      {stockStatus.text}
                    </Badge>
                  </div>
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                      <Badge
                        className={`text-white font-bold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg lg:shadow-xl text-xs sm:text-sm ${
                          product.is_flash_sale_active
                            ? "bg-gradient-to-r from-red-500 to-red-600 animate-bounce"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                      >
                        <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        -{discountPercent}%
                      </Badge>
                    </div>
                  )}
                  {/* Flash Sale Timer */}
                    {product.is_flash_sale_active && product.flash_sale_end ? (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center animate-pulse">
                      <Timer className="w-3 h-3 mr-1" />
                      {getTimeRemaining(product.flash_sale_end) || "0"}
                      </div>
                    </div>
                    ) : null}
                  {/* Enhanced Action Buttons - Hidden on mobile, visible on hover for larger screens */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:duration-500 transform group-hover:scale-100 scale-90 hidden sm:flex">
                    <Button
                      size="sm"
                      className="bg-white/95 text-gray-900 hover:bg-white shadow-lg sm:shadow-xl backdrop-blur-sm font-semibold transform hover:scale-110 transition-all duration-300 text-xs sm:text-sm"
                      asChild
                    >
                      <Link href={`/product/${product.id}`}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                        <span className="hidden lg:inline">Lihat Detail</span>
                        <span className="lg:hidden">Detail</span>
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`bg-white/95 backdrop-blur-sm shadow-lg sm:shadow-xl transition-all duration-300 transform hover:scale-110 ${
                        favorites.has(product.id)
                          ? "text-red-500 border-red-300 hover:bg-red-50"
                          : "text-gray-600 hover:text-red-500 border-gray-300"
                      }`}
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart
                        className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${
                          favorites.has(product.id) ? "fill-current" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
                {/* Enhanced Product Info */}
                <div className="p-3 sm:p-4 lg:p-6 relative">
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <Badge
                      className={`bg-gradient-to-r ${getCategoryColor(
                        product.category_name,
                      )} text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-2 shadow-md sm:shadow-lg text-xs sm:text-sm`}
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
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">{product.rating || 4.5}</span>
                    </div>
                  </div>
                  {/* Product Name */}
                  <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 line-clamp-2 group-hover:text-amber-700 transition-colors leading-tight">
                    {product.name}
                  </h3>
                  {/* Description - Hidden on mobile */}
                  <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm hidden sm:block">
                    {product.description}
                  </p>
                  {/* Stock Info */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 sm:px-3 sm:py-2 rounded-full">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Stok: </span>
                      <span className="font-semibold ml-1 text-gray-700">{product.stock}</span>
                    </div>
                    {product.stock > 0 && product.stock < 50 && (
                      <div className="flex items-center text-xs sm:text-sm text-orange-600 bg-orange-100 px-2 py-1 sm:px-3 sm:py-2 rounded-full font-semibold">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Terlaris</span>
                        <span className="sm:hidden">🔥</span>
                      </div>
                    )}
                  </div>
                  {/* Enhanced Pricing */}
                  <div className="mb-3 sm:mb-4 lg:mb-6 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-end justify-between">
                      <div>
                        {originalPrice && (
                          <div className="text-xs sm:text-sm text-gray-500 line-through font-medium mb-1">
                            {formatPrice(originalPrice)}
                          </div>
                        )}
                        <div
                          className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${
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
                    className={`w-full font-bold text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 lg:py-4 transition-all duration-300 sm:duration-500 transform hover:scale-105 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl ${
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
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Stok Habis</span>
                          <span className="sm:hidden">Habis</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {product.is_flash_sale_active ? "Beli Flash Sale!" : "Beli Sekarang"}
                          </span>
                          <span className="sm:hidden">{product.is_flash_sale_active ? "Flash!" : "Beli"}</span>
                        </>
                      )}
                    </Link>
                  </Button>
                  {/* Mobile Favorite Button */}
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
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center justify-center bg-gray-50 px-3 py-2 rounded-full">
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
      `}</style>
    </div>
  )
}
