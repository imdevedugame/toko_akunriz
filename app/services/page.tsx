"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Heart, MessageCircle, Eye, UserPlus, Share2, Package, Filter, Sparkles } from "lucide-react"
import { SocialMediaOrderModal } from "@/components/social-media-order-modal"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"

interface SocialCategory {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
  status: string
}

interface SocialService {
  id: number
  category_id: number
  name: string
  description: string
  service_type: string
  service_mode: "package" | "custom"
  price_user: number
  price_reseller: number
  min_order: number
  max_order: number
  features: string[]
  status: string
  category_name: string
  category_image: string
  package_count?: number
}

const serviceTypeIcons = {
  followers: Users,
  likes: Heart,
  comments: MessageCircle,
  views: Eye,
  subscribers: UserPlus,
  shares: Share2,
}

const serviceTypeLabels = {
  followers: "Followers",
  likes: "Likes",
  comments: "Comments",
  views: "Views",
  subscribers: "Subscribers",
  shares: "Shares",
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<SocialCategory[]>([])
  const [services, setServices] = useState<SocialService[]>([])
  const [filteredServices, setFilteredServices] = useState<SocialService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedServiceType, setSelectedServiceType] = useState("all")
  const [selectedServiceMode, setSelectedServiceMode] = useState("all")
  const [selectedService, setSelectedService] = useState<SocialService | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, selectedCategory, selectedServiceType, selectedServiceMode])

  const fetchData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch("/api/social-categories"),
        fetch("/api/social-services"),
      ])

      if (categoriesRes.ok && servicesRes.ok) {
        const categoriesData = await categoriesRes.json()
        const servicesData = await servicesRes.json()
        setCategories(categoriesData.categories.filter((cat: SocialCategory) => cat.status === "active"))
        setServices(servicesData.services.filter((service: SocialService) => service.status === "active"))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category_id.toString() === selectedCategory)
    }

    if (selectedServiceType !== "all") {
      filtered = filtered.filter((service) => service.service_type === selectedServiceType)
    }

    if (selectedServiceMode !== "all") {
      filtered = filtered.filter((service) => service.service_mode === selectedServiceMode)
    }

    setFilteredServices(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getServiceTypeIcon = (type: string) => {
    const Icon = serviceTypeIcons[type as keyof typeof serviceTypeIcons] || Users
    return <Icon className="h-5 w-5" />
  }

  const getUserPrice = (service: SocialService) => {
    return user?.role === "reseller" ? service.price_reseller : service.price_user
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-8 w-64 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg animate-pulse mx-auto"></div>
              <div className="h-4 w-96 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg animate-pulse mx-auto mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50"
                >
                  <CardContent className="p-6">
                    <div className="h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        <div className="relative container mx-auto px-4 py-8 lg:py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium Services
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Social Media
                </span>
                <span className="text-black"> Services</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Tingkatkan kehadiran media sosial Anda dengan layanan berkualitas tinggi kami. Followers, likes,
                comments, dan lebih banyak lagi!
              </p>
            </div>

            {/* Filters */}
            <Card
              className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Filter Layanan</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                    <Input
                      placeholder="Cari layanan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48 border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Pilih Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Platform</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                    <SelectTrigger className="w-full md:w-48 border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Jenis Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {Object.entries(serviceTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedServiceMode} onValueChange={setSelectedServiceMode}>
                    <SelectTrigger className="w-full md:w-48 border-amber-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Mode Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mode</SelectItem>
                      <SelectItem value="package">Paket</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan <span className="font-semibold text-amber-600">{filteredServices.length}</span> dari{" "}
                    <span className="font-semibold text-amber-600">{services.length}</span> layanan
                  </div>
                  {user?.role === "reseller" && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Harga Reseller</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
                <Card
                  key={service.id}
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up hover:rotate-1 relative overflow-hidden"
                  style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {service.category_image && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                          <Image
                            src={service.category_image || "/placeholder.svg"}
                            alt={service.category_name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getServiceTypeIcon(service.service_type)}
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          {serviceTypeLabels[service.service_type as keyof typeof serviceTypeLabels]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {service.service_mode === "package" ? (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                            <Package className="h-3 w-3 mr-1" />
                            Paket
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-amber-800 transition-colors duration-300">
                      {service.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                      {service.description}
                    </p>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {service.features.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              +{service.features.length - 3} lainnya
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Service Mode Info */}
                      {service.service_mode === "package" && service.package_count && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 group-hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{service.package_count} paket tersedia</span>
                          </div>
                        </div>
                      )}

                      {/* Price and Order Info */}
                      <div className="space-y-2">
                        {service.service_mode === "custom" ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Harga per 1000:</span>
                              <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {formatPrice(getUserPrice(service))}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                                <div className="text-green-600 font-medium">Min Order</div>
                                <div className="text-green-800 font-semibold">{service.min_order.toLocaleString()}</div>
                              </div>
                              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                <div className="text-blue-600 font-medium">Max Order</div>
                                <div className="text-blue-800 font-semibold">{service.max_order.toLocaleString()}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                            <div className="text-sm text-gray-600 mb-1">Mulai dari</div>
                            <div className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                              {formatPrice(getUserPrice(service))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Lihat paket untuk detail lengkap</div>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group-hover:animate-pulse"
                        onClick={() => setSelectedService(service)}
                      >
                        {service.service_mode === "package" ? "Lihat Paket" : "Pesan Sekarang"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12 animate-fade-in-up">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-gray-50/30 to-gray-100/50 backdrop-blur-sm max-w-md mx-auto">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada layanan ditemukan</h3>
                    <p className="text-gray-500">
                      {searchTerm ||
                      selectedCategory !== "all" ||
                      selectedServiceType !== "all" ||
                      selectedServiceMode !== "all"
                        ? "Coba sesuaikan kriteria pencarian atau filter Anda."
                        : "Belum ada layanan yang tersedia saat ini."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Order Modal */}
          {selectedService && (
            <SocialMediaOrderModal
              service={selectedService}
              isOpen={!!selectedService}
              onClose={() => setSelectedService(null)}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  )
}
