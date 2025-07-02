import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Search, ShoppingCart, CreditCard, CheckCircle, Eye, AlertTriangle } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Pilih Akun Premium",
    description: "Browse dan pilih akun premium yang Anda inginkan",
    icon: Search,
    details: [
      "Kunjungi halaman produk akun premium",
      "Lihat detail produk, harga, dan stok",
      "Bandingkan fitur yang ditawarkan",
      "Pastikan stok masih tersedia",
    ],
  },
  {
    number: 2,
    title: "Klik Beli Sekarang",
    description: "Klik tombol beli dan konfirmasi pembelian",
    icon: ShoppingCart,
    details: [
      'Klik tombol "Beli Sekarang" pada produk',
      "Review detail pembelian di modal konfirmasi",
      "Pastikan harga dan produk sudah benar",
      'Klik "Bayar Sekarang" untuk lanjut',
    ],
  },
  {
    number: 3,
    title: "Bayar via Xendit",
    description: "Selesaikan pembayaran melalui gateway Xendit",
    icon: CreditCard,
    details: [
      "Anda akan diarahkan ke halaman pembayaran Xendit",
      "Pilih metode pembayaran (Bank Transfer, E-Wallet, VA)",
      "Ikuti instruksi pembayaran yang diberikan",
      "Selesaikan pembayaran sesuai batas waktu",
    ],
  },
  {
    number: 4,
    title: "Terima Akun",
    description: "Akun akan ditampilkan otomatis setelah pembayaran sukses",
    icon: CheckCircle,
    details: [
      "Setelah pembayaran berhasil, Anda akan diarahkan kembali",
      "Modal popup akan menampilkan email & password akun",
      "Salin dan simpan data akun dengan aman",
      "Akun juga tersimpan di riwayat pembelian",
    ],
  },
]

export default function TutorialPembelianAkunPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href="/tutorial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tutorial Pembelian Akun Premium</h1>
          <p className="text-gray-600 mt-2">Panduan lengkap cara membeli akun premium dengan mudah dan aman</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card key={step.number} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center">
                      <Icon className="h-6 w-6 mr-2 text-blue-600" />
                      {step.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Important Notes */}
      <Card className="mt-12 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-orange-800">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Penting untuk Diperhatikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Setelah Menerima Akun:</h3>
              <ul className="space-y-2 text-orange-700">
                <li className="flex items-start">
                  <Eye className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Jangan ganti password</strong> - Akun akan otomatis logout jika password diubah
                  </span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Maksimal 1 device</strong> - Gunakan hanya di satu perangkat untuk menghindari konflik
                  </span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Logout setelah selesai</strong> - Selalu logout untuk menjaga keamanan akun
                  </span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Simpan data dengan aman</strong> - Catat email dan password di tempat yang aman
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Jika Mengalami Masalah:</h3>
              <ul className="space-y-2 text-orange-700">
                <li>• Akun tidak bisa login - Hubungi customer service dengan bukti pembelian</li>
                <li>• Akun terkena suspend - Akan diganti dengan akun baru dalam 24 jam</li>
                <li>• Lupa data akun - Cek di riwayat pembelian atau hubungi support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <Button asChild variant="outline">
          <Link href="/tutorial/layanan-indosmm">Tutorial IndoSMM</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Mulai Belanja</Link>
        </Button>
      </div>
    </div>
  )
}
