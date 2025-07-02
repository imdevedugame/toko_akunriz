"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Error Illustration */}
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <div className="text-2xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan</div>
            <p className="text-gray-600">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu tentang masalah ini.
            </p>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
              <p className="text-sm text-red-700 font-mono break-all">{error.message}</p>
              {error.digest && <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>}
            </div>
          )}

          {/* What happened */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Apa yang terjadi?</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Terjadi kesalahan sistem yang tidak terduga</li>
              <li>• Data mungkin sedang dimuat atau diproses</li>
              <li>• Koneksi ke server mungkin terputus</li>
              <li>• Layanan sedang dalam pemeliharaan</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Support
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Notice */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">Jika masalah berlanjut, silakan hubungi tim support kami</p>
            <p className="text-xs text-gray-500 mt-1">WhatsApp: +62 812-3456-7890 | Email: support@premiumstore.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
