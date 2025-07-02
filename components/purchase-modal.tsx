"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, Clock } from "lucide-react"

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
      <DialogContent
        className="max-w-md bg-transparent shadow-none border-none"
        style={{ background: "rgba(255,255,255,0.85)", boxShadow: "none" }}
      >
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembelian</DialogTitle>
          <DialogDescription>Pastikan detail pembelian Anda sudah benar</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Harga:</span>
                <span className="font-bold text-blue-600">{formatPrice(price)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Metode Pembayaran</span>
              </div>
              <p className="text-sm text-gray-600">
                Pembayaran melalui Xendit (Bank Transfer, E-Wallet, Virtual Account)
              </p>
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Keamanan Terjamin</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pembayaran 100% aman dengan Xendit</li>
              <li>• Akun dikirim otomatis setelah pembayaran</li>
              <li>• Garansi uang kembali jika akun bermasalah</li>
            </ul>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Pembayaran:</span>
            <span className="text-blue-600">{formatPrice(price)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button onClick={handlePurchase} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
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
