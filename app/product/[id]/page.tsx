"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  ShoppingCart,
  Shield,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  Crown,
  Package,
  Zap,
  Heart,
  Eye,
  CheckCircle,
  Award,
  Truck,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Store,
  TrendingUp,
} from "lucide-react"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { PurchaseModal } from "@/components/purchase-modal"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  user_price: number
  reseller_price: number
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
    return user?.role === "reseller" ? product.reseller_price : product.user_price
  }

  const getDiscountPercentage = () => {
    if (!product || user?.role !== "reseller") return 0
    return Math.round(((product.user_price - product.reseller_price) / product.user_price) * 100)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm animate-pulse">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-96 bg-gradient-to-r from-amber-100 to-orange-100" />
                </CardContent>
              </Card>
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 bg-gradient-to-r from-amber-200 to-orange-200 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm animate-pulse">
                <CardContent className="p-8 space-y-6">
                  <Skeleton className="h-8 w-32 bg-amber-200 rounded-full" />
                  <Skeleton className="h-12 w-3/4 bg-gradient-to-r from-amber-100 to-orange-100" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-32 bg-amber-200" />
                  </div>
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full bg-amber-100" />
                    ))}
                  </div>
                  <Skeleton className="h-16 w-full bg-gradient-to-r from-amber-200 to-orange-200 rounded-xl" />
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-12 max-w-md mx-auto shadow-lg border-0">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8 text-center leading-relaxed">
            {error || "Produk yang Anda cari tidak tersedia atau telah dihapus"}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.stock)
  const StockIcon = stockStatus.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-300/10 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Enhanced Product Images */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <ProductImageGallery
                  images={product.images.length > 0 ? product.images : ["/placeholder.svg?height=400&width=400"]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Product Info - Centered */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Store Description Card */}
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Digital Store Premium
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

            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Category & Actions */}
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    className={`bg-gradient-to-r ${getCategoryColor(product.category_name)} text-white font-semibold px-4 py-2 shadow-md`}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    {product.category_name}
                  </Badge>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`transition-all duration-300 hover:scale-105 ${
                        isFavorite
                          ? "text-red-500 border-red-300 hover:bg-red-50"
                          : "text-gray-600 hover:text-red-500 border-gray-300"
                      }`}
                      onClick={toggleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="transition-all duration-300 hover:scale-105 bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-semibold text-yellow-700">{product.rating || 4.5}</span>
                    </div>
                  </div>
                  <Badge className={`${stockStatus.color} text-white font-semibold px-3 py-2 shadow-md`}>
                    <StockIcon className="h-4 w-4 mr-2" />
                    {stockStatus.text} ({product.stock})
                  </Badge>
                </div>

                {/* Enhanced Pricing */}
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1 font-medium">Harga Terbaik</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {formatPrice(getPrice())}
                      </div>
                      {user?.role === "reseller" && getDiscountPercentage() > 0 && (
                        <div className="text-sm text-gray-500 line-through font-medium mt-1">
                          {formatPrice(product.user_price)}
                        </div>
                      )}
                    </div>
                    {user?.role === "reseller" && getDiscountPercentage() > 0 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 py-2 shadow-md">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Hemat {getDiscountPercentage()}%
                      </Badge>
                    )}
                  </div>
                  {user?.role === "reseller" && (
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-full mt-3">
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="font-semibold">💰 Harga khusus reseller</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Purchase Button */}
                {user ? (
                  <Button
                    size="lg"
                    className={`w-full h-14 font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                      product.stock === 0
                        ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    }`}
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Beli Sekarang
                      </>
                    ) : (
                      <>
                        <Package className="h-5 w-5 mr-2" />
                        Stok Habis
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    onClick={() => (window.location.href = "/auth/login")}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Login untuk Membeli
                  </Button>
                )}

                {/* Enhanced Guarantees */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">100% Aman</div>
                    <div className="text-xs text-gray-600">Transaksi Terjamin</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Proses Cepat</div>
                    <div className="text-xs text-gray-600">Instant Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">Support 24/7</div>
                    <div className="text-xs text-gray-600">Bantuan Kapan Saja</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Features */}
        {product.features && product.features.length > 0 && (
          <Card className="mt-12 border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Fitur Unggulan
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-colors duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Description & Tips */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Deskripsi Produk
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description || "Deskripsi produk akan segera tersedia."}
              </p>
            </CardContent>
          </Card>

          {product.tips && product.tips.length > 0 && (
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Tips Penggunaan
                  </h3>
                </div>
                <div className="space-y-4">
                  {product.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4 mt-1 shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-gray-800 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips & Tricks Section */}
        <Card className="mt-12 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tips & Tricks
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">Cara Pemesanan</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Pastikan data yang Anda masukkan sudah benar sebelum melakukan pemesanan untuk menghindari kesalahan.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 mb-3">Keamanan Akun</h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Jangan bagikan informasi akun Anda kepada orang lain untuk menjaga keamanan dan privasi.
                </p>
              </div>
              <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3">Customer Support</h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Hubungi tim support kami jika mengalami kendala atau butuh bantuan terkait produk.
                </p>
              </div>
              <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3">Garansi Produk</h4>
                <p className="text-sm text-orange-700 leading-relaxed">
                  Semua produk dilengkapi garansi penggantian jika terjadi masalah dalam 24 jam pertama.
                </p>
              </div>
              <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-bold text-red-900 mb-3">Pembayaran</h4>
                <p className="text-sm text-red-700 leading-relaxed">
                  Gunakan metode pembayaran yang aman dan pastikan saldo mencukupi sebelum checkout.
                </p>
              </div>
              <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-3">Promo & Diskon</h4>
                <p className="text-sm text-indigo-700 leading-relaxed">
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
  )
}
