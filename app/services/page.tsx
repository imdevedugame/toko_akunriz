"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Crown, Package, Heart, Instagram, Youtube, Music, Facebook, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useAuth } from "@/components/auth-provider"
import { IndoSMMPurchaseModal } from "@/components/indosmm-purchase-modal"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
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
    if (!user) {
      alert("Silahkan login terlebih dahulu untuk memesan layanan")
      return
    }
    setSelectedService(service)
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
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
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  : "bg-white hover:bg-gray-50"
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
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
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
        <Card className="mb-4 shadow-xl border-0 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                  <Input
                    placeholder="Cari layanan..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
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
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
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
              <Card key={category} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
                        className="p-4 border border-amber-200 rounded-lg cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:shadow-md transform hover:scale-[1.02]"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-2 line-clamp-2 text-gray-900">{service.name}</h4>
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Min: {service.min_order.toLocaleString()}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Max: {service.max_order.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                              {formatPrice(getRate(service), 1000)} / 1K
                            </div>
                            {!user && (
                              <div className="text-xs text-gray-500 mt-1">Klik untuk memesan (Login diperlukan)</div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            {user?.role === "reseller" && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
                                Reseller
                              </Badge>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(service.id)
                              }}
                              className="w-8 h-8 bg-white border border-amber-200 rounded-full flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.has(service.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State - No services found */}
        {services.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 max-w-sm mx-auto shadow-xl border-0">
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
                className="border-amber-200 hover:bg-amber-50"
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
                        pagination.page === pageNum
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                          : "border-amber-200 hover:bg-amber-50"
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
                      className="border-amber-200 hover:bg-amber-50"
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
                className="border-amber-200 hover:bg-amber-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Purchase Modal - Opens directly when service is clicked */}
        {selectedService && showPurchaseModal && (
          <IndoSMMPurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false)
              setSelectedService(null)
            }}
            service={selectedService}
            initialTarget=""
            initialQuantity={selectedService.min_order.toString()}
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
