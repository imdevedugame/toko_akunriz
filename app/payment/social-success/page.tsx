"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, ExternalLink, Copy, MessageCircle } from "lucide-react"
import Link from "next/link"

interface SocialOrder {
  id: number
  order_number: string
  service_name: string
  category_name: string
  package_name?: string
  quantity: number
  target_url: string
  whatsapp_number: string
  total_amount: number
  status: string
  payment_status: string
  is_custom: boolean
  created_at: string
}

export default function SocialSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<SocialOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/social-orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const openWhatsApp = () => {
    if (order) {
      const message = `Halo, saya telah melakukan pembayaran untuk pesanan ${order.order_number}. Mohon diproses. Terima kasih.`
      const whatsappUrl = `https://wa.me/${order.whatsapp_number}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
                <div className="space-y-3 mt-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Pesanan Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">
                Pesanan dengan nomor {orderNumber} tidak ditemukan atau belum tersedia.
              </p>
              <Link href="/services">
                <Button>Kembali ke Layanan</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Pembayaran Berhasil!</CardTitle>
            <p className="text-gray-600">Terima kasih! Pembayaran Anda telah berhasil diproses.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Detail Pesanan
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Pesanan:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{order.order_number}</span>
                    <Button variant="ghost" size="sm" onClick={copyOrderNumber} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copied && <span className="text-green-600 text-xs">Copied!</span>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layanan:</span>
                  <span className="font-medium">{order.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{order.category_name}</span>
                </div>
                {order.package_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket:</span>
                    <span className="font-medium">{order.package_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipe:</span>
                  <Badge variant={order.is_custom ? "outline" : "default"}>
                    {order.is_custom ? "Custom" : "Paket"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-medium">{order.quantity?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target URL:</span>
                  <a
                    href={order.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 max-w-xs truncate"
                  >
                    <span className="truncate">{order.target_url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total Pembayaran:</span>
                  <span className="text-green-600">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Status Pesanan</h3>
              <div className="flex items-center gap-2">
                <Badge variant="default">{order.status}</Badge>
                <Badge variant="default" className="bg-green-600">
                  {order.payment_status}
                </Badge>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Langkah Selanjutnya</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Pesanan Anda sedang diproses oleh tim kami</li>
                <li>• Proses biasanya dimulai dalam 1-24 jam</li>
                <li>• Anda akan mendapat update via WhatsApp</li>
                <li>• Simpan nomor pesanan untuk referensi</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={openWhatsApp} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Hubungi via WhatsApp
              </Button>
              <Link href="/history" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Lihat Riwayat Pesanan
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/services">
                <Button variant="ghost">Pesan Layanan Lain</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
