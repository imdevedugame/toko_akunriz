"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw, Home, CreditCard } from "lucide-react"
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

export default function PaymentPendingPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
      // Auto refresh every 30 seconds
      const interval = setInterval(fetchOrderDetails, 30000)
      return () => clearInterval(interval)
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)

        // Redirect to success if payment completed
        if (data.order.status === "completed" || data.order.status === "paid") {
          window.location.href = `/payment/success?order=${orderNumber}`
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const checkPaymentStatus = async () => {
    setChecking(true)
    await fetchOrderDetails()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
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
        {/* Pending Header */}
        <div className="text-center mb-8">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-orange-600 mb-2">Menunggu Pembayaran</h1>
          <p className="text-gray-600">Silakan selesaikan pembayaran Anda</p>
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
                <p className="font-bold text-orange-600">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal</label>
                <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="bg-orange-500">Menunggu Pembayaran</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instruksi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Cara Pembayaran:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Klik tombol "Lanjutkan Pembayaran" di bawah</li>
                <li>Pilih metode pembayaran yang diinginkan</li>
                <li>Ikuti instruksi pembayaran dari Xendit</li>
                <li>Setelah pembayaran berhasil, Anda akan diarahkan ke halaman sukses</li>
              </ol>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">⏰ Batas Waktu Pembayaran:</h4>
              <p className="text-sm text-orange-700">
                Pembayaran harus diselesaikan dalam 24 jam. Setelah itu, pesanan akan otomatis dibatalkan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {order.xendit_invoice_url && (
            <Button asChild className="w-full" size="lg">
              <a href={order.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                <CreditCard className="h-5 w-5 mr-2" />
                Lanjutkan Pembayaran
              </a>
            </Button>
          )}

          <Button variant="outline" onClick={checkPaymentStatus} disabled={checking} className="w-full">
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Mengecek Status...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Cek Status Pembayaran
              </>
            )}
          </Button>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/history" className="flex-1">
              <Button variant="outline" className="w-full">
                Lihat Riwayat Pesanan
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>

        {/* Auto Refresh Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Halaman ini akan otomatis memperbarui status setiap 30 detik</p>
        </div>
      </div>
    </div>
  )
}
