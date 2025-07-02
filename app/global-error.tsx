"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <div className="text-2xl font-semibold text-gray-800 mb-2">Kesalahan Sistem</div>
              <p className="text-gray-600 mb-6">
                Terjadi kesalahan sistem yang serius. Silakan muat ulang halaman atau hubungi support.
              </p>

              <div className="space-y-3">
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Muat Ulang Halaman
                </Button>

                <div className="text-sm text-gray-600">
                  <p>Jika masalah berlanjut:</p>
                  <p className="text-xs text-gray-500 mt-1">WhatsApp: +62 812-3456-7890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
