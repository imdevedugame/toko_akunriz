"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import {
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Download,
  Home,
  Instagram,
  MessageCircle,
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
    account_description?: string
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
        (account, index) =>
          `Product: ${account.product_name}\nEmail: ${account.account_email}\nPassword: ${account.account_password}\nDescription: ${account.account_description || "Tidak ada"}\n\n`,
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
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Order Tidak Ditemukan</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Order dengan nomor tersebut tidak ditemukan.</p>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-sm sm:text-base text-gray-600">Terima kasih atas pembelian Anda</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Nomor Order</label>
                <p className="font-mono text-sm break-all">{order.order_number}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Total Pembayaran</label>
                <p className="font-bold text-green-600 text-sm sm:text-base">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Tanggal</label>
                <p className="text-sm">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
                <Badge className="bg-green-500 text-xs">{order.status === "completed" ? "Selesai" : "Diproses"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Accounts */}
        {order.premium_accounts && order.premium_accounts.length > 0 && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl">Akun Premium Anda</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAccountInfo}
                className="w-full sm:w-auto bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Info
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {order.premium_accounts.map((account, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-green-50">
                  <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{account.product_name}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 text-xs sm:text-sm bg-white px-2 sm:px-3 py-2 rounded border break-all">
                          {account.account_email}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(account.account_email)}
                          className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Password</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 text-xs sm:text-sm bg-white px-2 sm:px-3 py-2 rounded border break-all">
                          {showPasswords[index]
                            ? account.account_password
                            : "*".repeat(account.account_password.length)}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => togglePassword(index)}
                          className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                        >
                          {showPasswords[index] ? (
                            <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(account.account_password)}
                          className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Deskripsi Akun</label>
                      <textarea
                        readOnly
                        className="w-full text-xs sm:text-sm text-gray-700 mt-1 bg-white border rounded p-2 sm:p-3 resize-none min-h-[80px]"
                        rows={4}
                        value={account.account_description || "Tidak ada deskripsi tersedia untuk akun ini."}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
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
      <div className="mt-4 text-center">
        <Button variant="outline" className="w-full sm:w-auto bg-transparent" onClick={() => setShowNetflixPopup(true)}>
          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
          Tampilkan Info Penting
        </Button>
      </div>
      {/* Netflix Private Account Popup */}
      <Dialog open={showNetflixPopup} onOpenChange={setShowNetflixPopup}>
        <DialogContent className="w-[90vw] max-w-md mx-auto bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 max-h-[80vh] overflow-y-auto sm:max-w-lg sm:max-h-[85vh]">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-lg shadow-lg">
                Terima Kasih & Info Penting
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Thank You Message */}
            <div className="text-center bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
              <div className="mb-3">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-green-800 text-base sm:text-lg">Terima Kasih Telah Berbelanja!</h3>
              </div>
              <p className="text-xs sm:text-sm text-green-700 mb-3 sm:mb-4">
                Terima kasih telah mempercayai Vyloz Zone untuk kebutuhan akun premium Anda. Jangan lupa follow
                Instagram kami untuk mendapatkan info promo dan giveaway menarik!
              </p>

              {/* Social Media Links */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <Link
                  href="https://www.instagram.com/vylozzone?igsh=bzdrNnR6N281eGUz"
                  target="_blank"
                  className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xs sm:text-sm font-medium shadow-md"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Follow @vylozzone
                </Link>
              </div>
            </div>

            {/* Screenshot Warning */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2 flex-shrink-0" />
                <h3 className="font-bold text-red-800 text-sm sm:text-base">WAJIB SCREENSHOT!</h3>
              </div>
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-red-700">
                  <strong>PENTING:</strong> Semua pembeli wajib screenshot halaman ini dan kirimkan ke admin sebagai
                  bukti pembelian.
                </p>
                <div className="bg-yellow-50 border border-yellow-300 rounded p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-yellow-800 font-medium">
                    📸 Screenshot halaman ini sekarang juga!
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    href="https://wa.me/6289630375723"
                    target="_blank"
                    className="inline-flex items-center bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-600 transition-all text-xs sm:text-sm font-medium shadow-md"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Kirim Screenshot ke Admin
                  </Link>
                </div>
                <div className="bg-red-100 border border-red-300 rounded p-2 sm:p-3 text-center">
                  <p className="text-xs sm:text-sm font-bold text-red-700">
                    ⚠️ JIKA TIDAK MENGIRIM SCREENSHOT, GARANSI AKUN AKAN HANGUS!
                  </p>
                </div>
              </div>
            </div>

            {/* Important Rules */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="font-bold text-orange-800 text-sm sm:text-base">Aturan Penggunaan</h3>
              </div>
              <ul className="text-xs sm:text-sm text-orange-700 space-y-1 sm:space-y-2">
                <li>• Jangan mengganti password akun</li>
                <li>• Maksimal 1 device bersamaan untuk streaming</li>
                <li>• Logout setelah selesai menggunakan</li>
                <li>• Simpan informasi akun dengan aman</li>
                <li>• Hubungi support jika ada masalah</li>
              </ul>
            </div>

            {/* Close Button */}
            <div className="text-center pt-2">
              <Button
                onClick={() => setShowNetflixPopup(false)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base font-medium shadow-lg"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
