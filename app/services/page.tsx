"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  Zap,
  Crown,
  Package,
  Eye,
  Heart,
  Instagram,
  Youtube,
  Music,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { IndoSMMPurchaseModal } from "@/components/indosmm-purchase-modal"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

interface IndoSMMService {
  id: number
  service_id: number
  name: string
  category: string
  rate: number
  min_order: number
  max_order: number
  user_rate: number
  reseller_rate: number
  image_url?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

const categoryIcons = {
  Instagram: Instagram,
  YouTube: Youtube,
  TikTok: Music,
  Facebook: Facebook,
  Twitter: TrendingUp,
  default: TrendingUp,
}

const categoryColors = {
  Instagram: "bg-purple-500",
  YouTube: "bg-red-500",
  TikTok: "bg-gray-800",
  Facebook: "bg-blue-500",
  Twitter: "bg-sky-500",
  default: "bg-amber-500",
}

const tutorials = [
  {
    id: "pembelian-akun",
    title: "Tutorial Pembelian Akun Premium",
    description:
      "Panduan lengkap cara membeli akun premium Netflix, Spotify, Disney+, dan platform lainnya dengan aman",
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    steps: 4,
    duration: "5 menit",
    difficulty: "Mudah",
    category: "Pembelian",
  },
  {
    id: "layanan-indosmm",
    title: "Tutorial Layanan IndoSMM",
    description: "Cara memesan followers, likes, views, dan engagement untuk semua platform media sosial Anda",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
    steps: 5,
    duration: "3 menit",
    difficulty: "Mudah",
    category: "SMM",
  },
  {
    id: "keamanan-akun",
    title: "Tips Keamanan Akun",
    description: "Panduan menjaga keamanan akun premium dan cara menggunakan dengan bijak",
    icon: Shield,
    color: "from-purple-500 to-purple-600",
    steps: 6,
    duration: "7 menit",
    difficulty: "Menengah",
    category: "Keamanan",
  },
  {
    id: "troubleshooting",
    title: "Mengatasi Masalah Umum",
    description: "Solusi untuk masalah yang sering terjadi saat menggunakan layanan kami",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    steps: 8,
    duration: "10 menit",
    difficulty: "Lanjutan",
    category: "Bantuan",
  },
]

const quickTips = [
  {
    category: "Pembelian Akun Premium",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    tips: [
      "Jangan pernah mengganti password akun yang sudah dibeli",
      "Gunakan maksimal 1 device secara bersamaan",
      "Selalu logout setelah selesai menggunakan",
      "Simpan data akun di tempat yang aman",
      "Laporkan jika akun bermasalah dalam 24 jam",
      "Jangan share akun dengan orang lain",
    ],
  },
  {
    category: "Layanan IndoSMM",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    tips: [
      "Pastikan akun media sosial tidak dalam mode private",
      "Masukkan username atau link dengan format yang benar",
      "Proses pengiriman membutuhkan waktu 1-24 jam",
      "Cek status pesanan di halaman riwayat pembelian",
      "Jangan ubah username saat proses berlangsung",
      "Hubungi support jika ada kendala",
    ],
  },
  {
    category: "Keamanan & Privasi",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    tips: [
      "Gunakan koneksi internet yang aman dan terpercaya",
      "Jangan login dari device publik atau tidak dikenal",
      "Aktifkan notifikasi untuk update status pesanan",
      "Backup data penting secara berkala",
      "Gunakan password yang kuat untuk akun Anda",
      "Laporkan aktivitas mencurigakan segera",
    ],
  },
]

const faqItems = [
  {
    question: "Berapa lama proses pengiriman akun premium?",
    answer:
      "Akun premium biasanya dikirim dalam 1-5 menit setelah pembayaran berhasil. Untuk layanan SMM, proses membutuhkan 1-24 jam.",
  },
  {
    question: "Apakah ada garansi untuk produk yang dibeli?",
    answer:
      "Ya, kami memberikan garansi 24 jam untuk akun premium dan garansi refill untuk layanan SMM sesuai ketentuan.",
  },
  {
    question: "Bagaimana cara mengetahui status pesanan saya?",
    answer: "Anda dapat mengecek status pesanan di halaman 'Riwayat Pesanan' setelah login ke akun Anda.",
  },
  {
    question: "Apakah aman menggunakan layanan ini?",
    answer: "Sangat aman. Kami menggunakan sistem keamanan berlapis dan tidak menyimpan data sensitif pelanggan.",
  },
]

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<IndoSMMService[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedService, setSelectedService] = useState<IndoSMMService | null>(null)
  const [orderData, setOrderData] = useState({
    target: "",
    quantity: "",
    notes: "",
  })
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchServices()
  }, [selectedCategory, pagination.page, searchTerm])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/services?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
        setCategories(data.categories || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (rate: number, quantity: number) => {
    const total = (rate * quantity) / 1000
    if (isNaN(total) || !isFinite(total) || total < 0) {
      return "Rp 0"
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(total)
  }

  const getRate = (service: IndoSMMService) => {
    return user?.role === "reseller" ? service.reseller_rate : service.user_rate
  }

  const handleServiceSelect = (service: IndoSMMService) => {
    setSelectedService(service)
    setOrderData({
      target: "",
      quantity: service.min_order.toString(),
      notes: "",
    })
  }

  const handleOrder = () => {
    if (!selectedService || !orderData.target || !orderData.quantity) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    const quantity = Number.parseInt(orderData.quantity)
    if (quantity < selectedService.min_order || quantity > selectedService.max_order) {
      alert(`Quantity harus antara ${selectedService.min_order} - ${selectedService.max_order}`)
      return
    }

    setShowPurchaseModal(true)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleFavorite = (serviceId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId)
      } else {
        newFavorites.add(serviceId)
      }
      return newFavorites
    })
  }

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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="space-y-3">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groupedServices = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, IndoSMMService[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile-First Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Layanan SMM</h1>
          <p className="text-sm text-gray-600">Tingkatkan media sosial dengan layanan berkualitas</p>
        </div>

        {/* Mobile Categories - Horizontal Scroll */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange("all")}
              className={`flex-shrink-0 text-xs ${
                selectedCategory === "all" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              Semua
            </Button>
            {categories.map((category) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className={`flex-shrink-0 text-xs ${
                    selectedCategory === category
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category}
                </Button>
              )
            })}
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
                    placeholder="Cari layanan..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Package className="h-3 w-3" />
                  <span>
                    {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} layanan
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

        {/* Services List - Mobile Optimized */}
        <div className="space-y-4 mb-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default
            const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.default

            return (
              <Card key={category} className="shadow-sm">
                <CardHeader className={`${colorClass} text-white p-4`}>
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold">{category}</div>
                      <div className="text-white/80 text-sm">{categoryServices.length} layanan</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedService?.id === service.id
                            ? "border-amber-400 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-2 line-clamp-2">{service.name}</h4>
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Min: {service.min_order.toLocaleString()}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Max: {service.max_order.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-lg font-bold text-amber-600">
                              {formatPrice(getRate(service), 1000)} / 1K
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            {user?.role === "reseller" && (
                              <Badge className="bg-green-500 text-white text-xs px-2 py-1">Reseller</Badge>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(service.id)
                              }}
                              className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.has(service.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {selectedService?.id === service.id && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <div className="text-xs text-amber-700 font-medium">✓ Layanan dipilih</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Form - Mobile Optimized */}
        {selectedService && (
          <Card className="mb-6 shadow-sm">
            <CardHeader className="bg-amber-500 text-white p-4">
              <CardTitle className="text-lg">Form Pemesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Layanan Dipilih</Label>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Image src="/sosmed.png" alt={selectedService.category} width={16} height={16} />
                    </div>
                    <div className="font-medium text-sm flex-1">{selectedService.name}</div>
                    <Badge
                      className={`${categoryColors[selectedService.category as keyof typeof categoryColors]} text-white text-xs px-2 py-1`}
                    >
                      {selectedService.category}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-600">
                      {formatPrice(getRate(selectedService), 1000)} per 1000
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="target" className="text-sm font-medium mb-2 block">
                  Target (Username/Link) *
                </Label>
                <Input
                  id="target"
                  placeholder="@username atau https://..."
                  value={orderData.target}
                  onChange={(e) => setOrderData({ ...orderData, target: e.target.value })}
                  className="h-10 border-gray-200 focus:border-amber-500"
                />
                <div className="text-xs text-gray-500 mt-1">Pastikan akun tidak private</div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                  Jumlah *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={selectedService.min_order}
                  max={selectedService.max_order}
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                  className="h-10 border-gray-200 focus:border-amber-500"
                />
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>Min: {selectedService.min_order.toLocaleString()}</span>
                  <span>Max: {selectedService.max_order.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                  Catatan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan..."
                  value={orderData.notes}
                  onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-amber-500 resize-none"
                />
              </div>

              {orderData.quantity && (
                <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Harga:</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatPrice(getRate(selectedService), Number.parseInt(orderData.quantity) || 0)}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleOrder}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
                disabled={!user || !orderData.target || !orderData.quantity}
              >
                {!user ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Login untuk Memesan
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Pesan Sekarang
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {!selectedService && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-auto shadow-sm">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Layanan</h3>
              <p className="text-sm text-gray-600">Pilih layanan dari daftar di atas untuk memulai pemesanan</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {services.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-auto shadow-sm">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Layanan</h3>
              <p className="text-sm text-gray-600">Coba ubah kata kunci pencarian atau kategori</p>
            </div>
          </div>
        )}

        {/* Mobile-Friendly Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(3, pagination.pages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        pagination.page === pageNum ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-gray-200"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {pagination.pages > 3 && pagination.page < pagination.pages - 1 && (
                  <>
                    <span className="text-gray-500 px-1">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.pages)}
                      className="border-gray-200"
                    >
                      {pagination.pages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {selectedService && showPurchaseModal && (
          <IndoSMMPurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            service={selectedService}
            initialTarget={orderData.target}
            initialQuantity={orderData.quantity}
            userRole={user?.role}
          />
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
