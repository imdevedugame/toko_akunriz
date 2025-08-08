"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Timer, Zap, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"

interface FlashSaleProduct {
  id: string
  name: string
  slug: string
  user_price: number
  flash_sale_price: number
  flash_sale_discount_percent: number
  flash_sale_end: string
  available_stock: number
  images: string[]
  category_name: string
  savings: number
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function FlashSaleTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

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
    <div className="flex items-center gap-2 text-white">
      <Timer className="h-4 w-4" />
      <div className="flex gap-1 text-sm font-bold">
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        <span>{String(timeLeft.hours).padStart(2, "0")}:</span>
        <span>{String(timeLeft.minutes).padStart(2, "0")}:</span>
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
      </div>
    </div>
  )
}

export function FlashSaleBanner() {
  const [products, setProducts] = useState<FlashSaleProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlashSaleProducts()

    // Refresh every minute
    const interval = setInterval(fetchFlashSaleProducts, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchFlashSaleProducts = async () => {
    try {
      const response = await fetch("/api/flash-sale/active?limit=5")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch flash sale products:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-red-600 to-red-700 p-4 animate-pulse">
        <div className="container mx-auto">
          <div className="h-6 bg-red-500 rounded mb-2 w-48"></div>
          <div className="h-4 bg-red-500 rounded w-64"></div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">⚡ FLASH SALE</h2>
              <p className="text-red-100">Diskon hingga 70% - Waktu Terbatas!</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-semibold">Berakhir Segera!</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="aspect-square bg-white/20 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={product.images[0] || "/placeholder.svg?height=120&width=120"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=120&width=120&text=No+Image"
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <Badge className="bg-yellow-400 text-yellow-900 font-bold text-xs">
                    -{product.flash_sale_discount_percent}%
                  </Badge>

                  <h3 className="font-semibold text-sm line-clamp-2 text-white">{product.name}</h3>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-yellow-300">{formatPrice(product.flash_sale_price)}</span>
                    </div>
                    <div className="text-xs text-red-200 line-through">{formatPrice(product.user_price)}</div>
                    <div className="text-xs text-green-300 font-semibold">Hemat {formatPrice(product.savings)}</div>
                  </div>

                  {/* Timer */}
                  <div className="bg-black/20 rounded-lg p-2">
                    <FlashSaleTimer endDate={product.flash_sale_end} />
                  </div>

                  {/* Stock & Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-100">Stok: {product.available_stock}</span>
                    <Link href={`/product/${product.id}`}>
                      <Button
                        size="sm"
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-xs h-8"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Beli
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-6">
          <Link href="/products?flash_sale=true">
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold"
            >
              Lihat Semua Flash Sale
              <Zap className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
