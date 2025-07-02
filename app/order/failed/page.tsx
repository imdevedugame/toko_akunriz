"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { XCircle, RefreshCw, Home, MessageCircle } from "lucide-react"
import Link from "next/link"

interface OrderDetails {
  id: number
  order_number: string
  type: string
  total_amount: number
  status: string
  created_at: string
  xendit_invoice_url?: string
}

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const retryPayment = () => {
    if (order?.xendit_invoice_url) {
      window.open(order.xendit_invoice_url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Order dengan nomor tersebut tidak ditemukan.</p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Failed Header */}
        <div className="text-center mb-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Pembayaran Gagal</h1>
          <p className="text-gray-600">Terjadi masalah dengan pembayaran Anda</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nomor Order</label>
                <p className="font-mono text-sm">{order.order_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Pembayaran</label>
                <p className="font-bold text-red-600">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal</label>
                <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="bg-red-500">Pembayaran Gagal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failure Reasons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kemungkinan Penyebab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Pembayaran mungkin gagal karena:</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Saldo tidak mencukupi</li>
                <li>Kartu kredit/debit ditolak</li>
                <li>Koneksi internet terputus</li>
                <li>Batas waktu pembayaran habis</li>
                <li>Masalah teknis dari penyedia pembayaran</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Solutions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Apa yang bisa Anda lakukan?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Solusi:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Coba lagi dengan metode pembayaran yang berbeda</li>
                  <li>Pastikan saldo atau limit kartu mencukupi</li>
                  <li>Periksa koneksi internet Anda</li>
                  <li>Hubungi customer service jika masalah berlanjut</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {order.xendit_invoice_url && (
            <Button onClick={retryPayment} className="w-full" size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Coba Bayar Lagi
            </Button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <Link href="/contact">
                <MessageCircle className="h-4 w-4 mr-2" />
                Hubungi Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>

          <Button variant="outline" asChild className="w-full">
            <Link href="/history">Lihat Riwayat Pesanan</Link>
          </Button>
        </div>

        {/* Help Notice */}
        <div className="mt-6 text-center">
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600">Butuh bantuan? Tim customer service kami siap membantu Anda 24/7</p>
            <p className="text-sm text-gray-500 mt-1">WhatsApp: +62 96-3037-5723
 | Email: rivaz.store15@gmail.com
</p>
          </div>
        </div>
      </div>
    </div>
  )
}
