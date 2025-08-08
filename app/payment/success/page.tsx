"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Download,
  Home,
  Instagram,
  MessageCircle,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface OrderDetails {
  id: number
  order_number: string
  type: string
  total_amount: number
  status: string
  created_at: string
  premium_accounts?: Array<{
    product_name: string
    account_email: string
    account_password: string
  }>
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})
  const [showNetflixPopup, setShowNetflixPopup] = useState(false)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  useEffect(() => {
    // Show popup without any conditions
    if (order) {
      setShowNetflixPopup(true)
    }
  }, [order])

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Disalin ke clipboard!")
  }

  const togglePassword = (index: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const downloadAccountInfo = () => {
    if (!order?.premium_accounts) return

    const content = order.premium_accounts
      .map(
        (account) =>
          `Product: ${account.product_name}\nEmail: ${account.account_email}\nPassword: ${account.account_password}\n\n`,
      )
      .join("")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `account-info-${order.order_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-600">Terima kasih atas pembelian Anda</p>
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
                <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal</label>
                <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="bg-green-500">{order.status === "completed" ? "Selesai" : "Diproses"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Accounts */}
        {order.premium_accounts && order.premium_accounts.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Akun Premium Anda</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadAccountInfo}>
                <Download className="h-4 w-4 mr-2" />
                Download Info
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.premium_accounts.map((account, index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-lg mb-4">{account.product_name}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 text-sm bg-white px-3 py-2 rounded border">
                          {account.account_email}
                        </code>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(account.account_email)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Password</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 text-sm bg-white px-3 py-2 rounded border">
                          {showPasswords[index]
                            ? account.account_password
                            : "*".repeat(account.account_password.length)}
                        </code>
                        <Button variant="outline" size="icon" onClick={() => togglePassword(index)}>
                          {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(account.account_password)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-semibold text-orange-800 mb-2">⚠️ Penting untuk Diperhatikan:</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Jangan ganti password akun</li>
                  <li>• Maksimal 1 device bersamaan untuk streaming</li>
                  <li>• Logout setelah selesai menggunakan</li>
                  <li>• Simpan informasi ini dengan aman</li>
                  <li>• Hubungi support jika ada masalah</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Lihat Riwayat Pesanan
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>

      {/* Netflix Private Account Popup */}
      <Dialog open={showNetflixPopup} onOpenChange={setShowNetflixPopup}>
        <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">NETFLIX PRIVATE</div>
            </div>
            <DialogTitle className="text-xl font-bold text-red-800">Informasi Penting</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-bold text-yellow-800">WAJIB DI BACA !!</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Syarat dan Ketentuan dibawah ini wajib ditaati, apabila melanggar maka garansi hangus.
              </p>
              <div className="text-center">
                <p className="text-sm font-medium text-yellow-800 mb-2">Download dan baca ⬇️</p>
                <Button variant="outline" size="sm" className="bg-white">
                  <FileText className="h-4 w-4 mr-2" />
                  {"[ File ]"}
                </Button>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="text-center bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800 mb-3">Terimakasih telah order di Vyloz Zone!</p>
              <p className="text-sm text-green-700 mb-4">
                Tidak ingin tertinggal informasi terbaru serta seputar Giveaway dan Promo menarik? Follow Instagram
                @vylozzone
              </p>

              {/* Social Media Links */}
              <div className="flex justify-center space-x-4 mb-4">
                <Link
                  href="https://www.instagram.com/vylozzone?igsh=bzdrNnR6N281eGUz"
                  target="_blank"
                  className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Follow Instagram
                </Link>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-bold text-red-800">WAJIB !!</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Semua pembeli wajib ScreenShot halaman ini lalu kirimkan foto bukti screenshot ke nomor admin dibawah
                ini :
              </p>
              <div className="text-center">
                <Link
                  href="https://wa.me/6289630375723"
                  target="_blank"
                  className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Kirim Screenshot ke Admin
                </Link>
              </div>
              <p className="text-xs text-red-600 font-bold mt-3 text-center">
                JIKA PEMBELI TIDAK MENGIRIM MAKA GARANSI HANGUS.
              </p>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <Button
                onClick={() => setShowNetflixPopup(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
              >
                <X className="h-4 w-4 mr-2" />
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
