"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Eye, EyeOff, Shield, Clock } from "lucide-react"
import { useState } from "react"

interface PremiumOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
  order_details: {
    product_name: string
    account_email: string
    account_password: string
  }
}

interface AccountDetailsModalProps {
  order: PremiumOrder
  isOpen: boolean
  onClose: () => void
}

export function AccountDetailsModal({ order, isOpen, onClose }: AccountDetailsModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Disalin ke clipboard!")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Detail Akun Premium</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{order.order_details.product_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="font-mono">{order.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Bayar</label>
                  <p className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Pembelian</label>
                  <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="font-medium text-green-600">{order.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded">
                    {order.order_details.account_email}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(order.order_details.account_email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Password</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded">
                    {showPassword
                      ? order.order_details.account_password
                      : "*".repeat(order.order_details.account_password.length)}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(order.order_details.account_password)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-orange-800">
                <Clock className="h-5 w-5 mr-2" />
                Penting untuk Diperhatikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Jangan ganti password akun</li>
                <li>• Maksimal 1 device bersamaan</li>
                <li>• Logout setelah selesai menggunakan</li>
                <li>• Simpan informasi ini dengan aman</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Tutup</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
