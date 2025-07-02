"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* 404 Illustration */}
          <div className="mb-6">
            <div className="text-8xl font-bold text-blue-600 mb-2">404</div>
            <div className="text-2xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</div>
            <p className="text-gray-600">
              Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
            </p>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Yang bisa Anda lakukan:</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Periksa kembali URL yang Anda masukkan</li>
              <li>• Kembali ke halaman sebelumnya</li>
              <li>• Gunakan menu navigasi untuk mencari halaman</li>
              <li>• Hubungi support jika masalah berlanjut</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">
                  <Search className="h-4 w-4 mr-2" />
                  Cari Produk
                </Link>
              </Button>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-800 mb-3">Halaman Populer:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/products" className="text-sm text-blue-600 hover:underline">
                Produk Premium
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/services" className="text-sm text-blue-600 hover:underline">
                Layanan IndoSMM
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/tutorial" className="text-sm text-blue-600 hover:underline">
                Tutorial
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/contact" className="text-sm text-blue-600 hover:underline">
                Kontak
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
