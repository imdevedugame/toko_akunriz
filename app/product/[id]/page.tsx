"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, ShoppingCart, Shield, Clock, Users, AlertCircle, Sparkles, Crown, Package, Zap, Heart, Eye, CheckCircle, Award, Truck, RefreshCw, HelpCircle, Store, TrendingUp, Timer } from 'lucide-react'
import { ProductImageGallery } from "@/components/product-image-gallery"
import { PurchaseModal } from "@/components/purchase-modal"
import Head from "next/head"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  user_price: number
  reseller_price: number
  fake_price?: number
  stock: number
  category_name: string
  category_slug: string
  rating: number
  features: string[]
  tips: string[]
  status: string
  created_at: string
  updated_at: string
  userPrice: number
  resellerPrice: number
  is_flash_sale?: boolean
  is_flash_sale_active?: boolean
  flash_sale_price?: number
  flash_sale_discount_percent?: number
  flash_sale_end?: string
  category: {
    name: string
    slug: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: "user" | "reseller" | "admin"
  balance: number
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

function FlashSaleTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeLeft(null)
        clearInterval(timer)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return null

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
        <span className="font-bold text-red-800 text-sm sm:text-base">Flash Sale Berakhir Dalam:</span>
      </div>
      <div className="flex gap-2 justify-center">
        {timeLeft.days > 0 && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 sm:px-3 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
            <div className="text-lg sm:text-xl font-bold">{timeLeft.days}</div>
            <div className="text-xs">Hari</div>
          </div>
        )}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 sm:px-3 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
          <div className="text-lg sm:text-xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs">Jam</div>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 sm:px-3 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
          <div className="text-lg sm:text-xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs">Menit</div>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 sm:px-3 sm:py-3 rounded-lg text-center min-w-[50px] sm:min-w-[60px] shadow-lg">
          <div className="text-lg sm:text-xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs">Detik</div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchUser()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          const data = await response.json()
          setProduct({
            ...data.product,
            userPrice: data.product.user_price,
            resellerPrice: data.product.reseller_price,
            category: {
              name: data.product.category_name,
              slug: data.product.category_slug,
            },
          })
        }
        throw new Error("Gagal memuat produk")
      }
      
      const data = await response.json()
      setProduct(data.product)
    } catch (error) {
      console.error("Fetch product error:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Fetch user error:", error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPrice = () => {
    if (!product) return 0
    // If flash sale is active, show flash sale price
    if (product.is_flash_sale_active && product.flash_sale_price) {
      return user?.role === "reseller" ? product.reseller_price : product.flash_sale_price
    }
    return user?.role === "reseller" ? product.reseller_price : product.user_price
  }

  const getOriginalPrice = () => {
    if (!product) return null
    if (product.is_flash_sale_active) {
      return product.user_price
    }
    if (product.fake_price && product.fake_price > product.user_price) {
      return product.fake_price
    }
    return user?.role === "reseller" ? product.user_price : null
  }

  const getDiscountPercentage = () => {
    if (!product) return 0
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

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Habis", color: "bg-gradient-to-r from-red-500 to-red-600", icon: Package }
    if (stock < 10) return { text: "Terbatas", color: "bg-gradient-to-r from-orange-500 to-amber-500", icon: Clock }
    return { text: "Tersedia", color: "bg-gradient-to-r from-green-500 to-emerald-500", icon: CheckCircle }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // SEO Schema Markup for Product
  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} premium murah di Vyloz Premium Zone`,
        image: product.images.length > 0 ? product.images : ["/placeholder.svg?height=400&width=400"],
        brand: {
          "@type": "Brand",
          name: "Vyloz Premium Zone",
        },
        offers: {
          "@type": "Offer",
          price: getPrice(),
          priceCurrency: "IDR",
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Vyloz Premium Zone",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 4.9,
          reviewCount: 1000,
        },
      }
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm animate-pulse">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-64 sm:h-96 bg-gradient-to-r from-amber-100 to-orange-100" />
                </CardContent>
              </Card>
              <div className="flex gap-2 sm:gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-200 to-orange-200 rounded-xl" />
                ))}
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm animate-pulse">
                <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  <Skeleton className="h-6 sm:h-8 w-32 bg-amber-200 rounded-full" />
                  <Skeleton className="h-8 sm:h-12 w-3/4 bg-gradient-to-r from-amber-100 to-orange-100" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-32 bg-amber-200" />
                  </div>
                  <Skeleton className="h-12 sm:h-16 w-full bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full bg-amber-100" />
                    ))}
                  </div>
                  <Skeleton className="h-12 sm:h-16 w-full bg-gradient-to-r from-amber-200 to-orange-200 rounded-xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 sm:p-12 max-w-md mx-auto shadow-lg border-0">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-md">
            <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-center leading-relaxed">
            {error || "Produk yang Anda cari tidak tersedia atau telah dihapus"}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 sm:py-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.stock)
  const StockIcon = stockStatus.icon
  const originalPrice = getOriginalPrice()
  const currentPrice = getPrice()
  const discountPercent = getDiscountPercentage()

  return (
    <>
      <Head>
        <title>{`${product.name} - Vyloz Premium Zone | Akun Premium Murah`}</title>
        <meta
          name="description"
          content={`Beli ${product.name} premium murah di Vyloz Premium Zone. Harga mulai ${formatPrice(currentPrice)}. Garansi 100%, proses instant, support 24/7.`}
        />
        <meta
          name="keywords"
          content={`${product.name} murah, ${product.name} premium, akun ${product.category_name} murah, Vyloz Premium Zone`}
        />
        <link rel="canonical" href={`https://vyloz-premium-zone.vercel.app/product/${product.id}`} />
        {/* Open Graph */}
        <meta property="og:title" content={`${product.name} - Vyloz Premium Zone`} />
        <meta
          property="og:description"
          content={`Beli ${product.name} premium murah. Harga mulai ${formatPrice(currentPrice)}. Garansi 100%.`}
        />
        <meta property="og:image" content={product.images[0] || "/placeholder.svg?height=400&width=400"} />
        <meta property="og:url" content={`https://vyloz-premium-zone.vercel.app/product/${product.id}`} />
        {/* Twitter Card */}
        <meta name="twitter:title" content={`${product.name} - Vyloz Premium Zone`} />
        <meta
          name="twitter:description"
          content={`Beli ${product.name} premium murah. Harga mulai ${formatPrice(currentPrice)}.`}
        />
        <meta name="twitter:image" content={product.images[0] || "/placeholder.svg?height=400&width=400"} />
        {/* Schema Markup */}
        {productSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        )}
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-300/10 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 py-4 sm:py-8">
          {/* Store Description Card - Mobile First */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6 lg:hidden">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <img src="/Logo.png" alt="PremiumStore Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Vyloz Premium Zone
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Platform terpercaya untuk membeli akun premium dengan harga terjangkau.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-gray-600">10K+ Pelanggan</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  <span className="text-gray-600">100% Aman</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <ProductImageGallery
                    images={
                      product.images.length > 0
                        ? product.images
                        : ["/placeholder.svg?height=400&width=400&text=" + encodeURIComponent(product.name)]
                    }
                    productName={product.name}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Product Info - Combined Card */}
            <div className="space-y-4 sm:space-y-6">
              {/* Store Description Card - Desktop */}
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hidden lg:block">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <img src="/Logo.png" alt="PremiumStore Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Vyloz Premium Zone
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Platform terpercaya untuk membeli akun premium dengan harga terjangkau. Kami menyediakan berbagai
                    layanan digital berkualitas tinggi dengan garansi 100% dan support 24/7.
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">10K+ Pelanggan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">100% Aman</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combined Main Product Card - All in One */}
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  {/* Category & Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      className={`bg-gradient-to-r ${getCategoryColor(product.category_name)} text-white font-semibold px-3 py-1 text-xs sm:text-sm shadow-md`}
                    >
                      <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {product.category_name}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`transition-all duration-300 hover:scale-105 p-2 ${
                          isFavorite
                            ? "text-red-500 border-red-300 hover:bg-red-50"
                            : "text-gray-600 hover:text-red-500 border-gray-300"
                        }`}
                        onClick={toggleFavorite}
                      >
                        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="transition-all duration-300 hover:scale-105 bg-transparent p-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Flash Sale Badge */}
                  {product.is_flash_sale_active ? (
                    <div className="mb-4">
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 text-xs sm:text-sm shadow-md animate-pulse">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        FLASH SALE AKTIF
                      </Badge>
                    </div>
                  ) : null }

                  {/* Product Name */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating & Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              i < Math.floor(product.rating || 4.5)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 sm:ml-2 font-semibold text-yellow-700 text-xs sm:text-sm">
                          {product.rating || 4.5}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${stockStatus.color} text-white font-semibold px-2 sm:px-3 py-1 shadow-md text-xs sm:text-sm`}>
                      <StockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {stockStatus.text} ({product.stock})
                    </Badge>
                  </div>

                  {/* Combined Description & Features - Moved to middle */}
                  <div className="mb-6">
                    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                      {/* Description */}
                      <div>
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Deskripsi Produk
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {product.description ||
                            `${product.name} premium dengan kualitas terbaik di Vyloz Premium Zone. Dapatkan akses penuh dengan harga terjangkau dan garansi 100%.`}
                        </p>
                      </div>

                      {/* Features */}
                      {product.features && product.features.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                              Fitur Unggulan
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {product.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors duration-300"
                              >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 sm:h-3 sm:w-3 text-white" />
                                </div>
                                <span className="font-medium text-gray-800 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flash Sale Timer */}
                  {product.is_flash_sale_active && product.flash_sale_end ? (
                    <FlashSaleTimer endDate={product.flash_sale_end} />
                  ) : null }

                  {/* Pricing - Shopee Style */}
                  <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
                          {product.is_flash_sale_active ? "Harga Flash Sale" : "Harga Terbaik"}
                        </div>
                        {originalPrice && (
                          <div className="text-sm text-gray-500 line-through font-medium mb-1">
                            {formatPrice(originalPrice)}
                          </div>
                        )}
                        <div
                          className={`text-2xl sm:text-3xl font-bold ${
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
                          className={`font-bold px-2 sm:px-3 py-1 sm:py-2 shadow-md text-xs sm:text-sm ${
                            product.is_flash_sale_active
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          }`}
                        >
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Hemat {discountPercent}%
                        </Badge>
                      )}
                    </div>
                    {user?.role === "reseller" && (
                      <div className="flex items-center text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full mt-3 text-xs sm:text-sm">
                        <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="font-semibold">💰 Harga khusus reseller</span>
                      </div>
                    )}
                    {product.is_flash_sale_active ? (
                      <div className="flex items-center text-red-600 bg-red-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full mt-3 text-xs sm:text-sm">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="font-semibold">⚡ Flash Sale - Waktu Terbatas!</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Purchase Button - Shopee Style */}
                  {user ? (
                    <Button
                      size="lg"
                      className={`w-full h-12 sm:h-14 font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg mb-6 ${
                        product.stock === 0
                          ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
                          : product.is_flash_sale_active
                          ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                          : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                      }`}
                      onClick={() => setShowPurchaseModal(true)}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? (
                        <>
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {product.is_flash_sale_active ? "Beli Flash Sale Sekarang!" : "Beli Sekarang"}
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Stok Habis
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 mb-6"
                      onClick={() => (window.location.href = "/auth/login")}
                    >
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Login untuk Membeli
                    </Button>
                  )}

                  {/* Guarantees */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
                        <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-800">100% Aman</div>
                      <div className="text-xs text-gray-600 hidden sm:block">Transaksi Terjamin</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
                        <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-800">Proses Cepat</div>
                      <div className="text-xs text-gray-600 hidden sm:block">Instant Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-md">
                        <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-800">Support 24/7</div>
                      <div className="text-xs text-gray-600 hidden sm:block">Bantuan Kapan Saja</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-6"></div>

                  {/* Combined Description & Features */}
                  {/* Remove this section */}

                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tips Section */}
          {product.tips && product.tips.length > 0 && (
            <Card className="mt-8 sm:mt-12 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Tips Penggunaan
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {product.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors duration-300"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-1 shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-xs sm:text-sm">{index + 1}</span>
                      </div>
                      <span className="text-gray-800 leading-relaxed text-sm sm:text-base">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips & Tricks Section */}
          <Card className="mt-8 sm:mt-12 border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <HelpCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tips & Tricks
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">Cara Pemesanan</h4>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    Pastikan data yang Anda masukkan sudah benar sebelum melakukan pemesanan untuk menghindari
                    kesalahan.
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2 sm:mb-3 text-sm sm:text-base">Keamanan Akun</h4>
                  <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                    Jangan bagikan informasi akun Anda kepada orang lain untuk menjaga keamanan dan privasi.
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2 sm:mb-3 text-sm sm:text-base">Customer Support</h4>
                  <p className="text-xs sm:text-sm text-purple-700 leading-relaxed">
                    Hubungi tim support kami jika mengalami kendala atau butuh bantuan terkait produk.
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-2 sm:mb-3 text-sm sm:text-base">Garansi Produk</h4>
                  <p className="text-xs sm:text-sm text-orange-700 leading-relaxed">
                    Semua produk dilengkapi garansi penggantian jika terjadi masalah dalam 24 jam pertama.
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-red-50 rounded-xl border border-red-200">
                  <h4 className="font-bold text-red-900 mb-2 sm:mb-3 text-sm sm:text-base">Pembayaran</h4>
                  <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                    Gunakan metode pembayaran yang aman dan pastikan saldo mencukupi sebelum checkout.
                  </p>
                </div>
                <div className="p-4 sm:p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h4 className="font-bold text-indigo-900 mb-2 sm:mb-3 text-sm sm:text-base">Promo & Diskon</h4>
                  <p className="text-xs sm:text-sm text-indigo-700 leading-relaxed">
                    Ikuti media sosial kami untuk mendapatkan info promo dan diskon menarik setiap harinya.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Modal */}
          {user && (
            <PurchaseModal
              isOpen={showPurchaseModal}
              onClose={() => setShowPurchaseModal(false)}
              product={product}
              price={getPrice()}
            />
          )}
        </div>
      </div>
    </>
  )
}
