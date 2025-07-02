"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, Clock, ShoppingCart, X, CheckCircle, Star, Package, Zap } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  userPrice: number
  resellerPrice: number
  stock: number
  category: string
  rating: number
  features: string[]
  tips: string[]
}

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  price: number
}

export function PurchaseModal({ isOpen, onClose, product, price }: PurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handlePurchase = async () => {
    setIsProcessing(true)
    try {
      // Create order via API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "premium_account",
          items: [
            {
              product_id: product.id,
              quantity: 1,
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment URL or pending page
        if (data.order.payment_url) {
          window.location.href = data.order.payment_url
        } else {
          window.location.href = `/payment/pending?order=${data.order.order_number}`
        }
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl">Konfirmasi Pembelian</div>
                <div className="text-sm font-normal text-gray-600">Akun Premium Digital</div>
              </div>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-amber-100 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <DialogDescription className="text-gray-600 text-sm">
            Pastikan detail pembelian Anda sudah benar sebelum melanjutkan pembayaran
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">{product.category}</Badge>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    )}
                    {product.stock > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                        Stok: {product.stock}
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Harga:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {formatPrice(price)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Metode Pembayaran</h4>
                  <p className="text-sm text-gray-600">Gateway pembayaran terpercaya</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">Tersedia melalui Xendit:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                  <div>• Bank Transfer</div>
                  <div>• E-Wallet</div>
                  <div>• Virtual Account</div>
                  <div>• QRIS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Guarantee Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">Keamanan & Garansi</h4>
                  <p className="text-sm text-green-700">100% aman dan terpercaya</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">Pembayaran 100% aman dengan enkripsi SSL</span>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">Akun dikirim otomatis dalam 1-5 menit</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">Garansi uang kembali jika akun bermasalah</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-amber-200" />

          {/* Total Payment */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-amber-900">Total Pembayaran:</span>
                  <p className="text-xs text-amber-700 mt-1">Sudah termasuk biaya admin</p>
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {formatPrice(price)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 font-medium"
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Bayar Sekarang
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
