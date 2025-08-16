"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProductImageGallery } from "@/components/product-image-gallery"

interface Product {
  id: number
  name: string
  slug: string
  description: string
  category_name: string
  user_price: number
  reseller_price: number
  stock: number
  status: string
  images: string[]
  features: string[]
  tips: string[]
  created_at: string
}

interface ProductViewModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function ProductViewModal({ product, isOpen, onClose }: ProductViewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white ">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={product.images} />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <Badge className="mb-2">{product.category_name}</Badge>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <Separator />

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>User Price:</span>
                  <span className="font-semibold">{formatCurrency(product.user_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reseller Price:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(product.reseller_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>{product.stock}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {product.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {product.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-gray-500">
              Created: {new Date(product.created_at).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
