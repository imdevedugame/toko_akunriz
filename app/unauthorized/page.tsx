import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX, Home, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
            <p className="text-gray-600">
              Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya dapat diakses oleh administrator.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Login dengan Akun Lain
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
