import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, List, Edit, CreditCard, Send, BarChart3, AlertTriangle, Clock, CheckCircle } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Pilih Layanan Social Media",
    description: "Browse dan pilih layanan media sosial yang diinginkan",
    icon: List,
    details: [
      "Kunjungi halaman layanan Social Media",
      "Pilih platform (Instagram, YouTube, TikTok, dll)",
      "Lihat daftar layanan yang tersedia",
      "Bandingkan harga dan kualitas layanan",
    ],
  },
  {
    number: 2,
    title: "Isi Target dan Jumlah",
    description: "Masukkan username/link dan jumlah yang diinginkan",
    icon: Edit,
    details: [
      "Masukkan username atau link akun media sosial",
      "Pastikan akun tidak dalam mode private",
      "Tentukan jumlah followers/likes/views yang diinginkan",
      "Sistem akan menghitung total harga otomatis",
    ],
  },
  {
    number: 3,
    title: "Klik Bayar",
    description: "Konfirmasi pesanan dan lanjut ke pembayaran",
    icon: CreditCard,
    details: [
      "Review detail pesanan dan total harga",
      "Pastikan target dan jumlah sudah benar",
      'Klik "Bayar Sekarang" untuk melanjutkan',
      "Anda akan diarahkan ke halaman pembayaran Xendit",
    ],
  },
  {
    number: 4,
    title: "Bayar via Xendit",
    description: "Selesaikan pembayaran melalui gateway Xendit",
    icon: Send,
    details: [
      "Pilih metode pembayaran yang diinginkan",
      "Ikuti instruksi pembayaran yang diberikan",
      "Selesaikan pembayaran sesuai batas waktu",
      "Tunggu konfirmasi pembayaran berhasil",
    ],
  },
  {
    number: 5,
    title: "Order Diproses",
    description: "Order otomatis diproses setelah pembayaran sukses",
    icon: BarChart3,
    details: [
      "Sistem otomatis memproses order Anda",
      "Anda akan mendapat order ID untuk tracking",
      'Notifikasi "Order berhasil dibuat" akan muncul',
      "Order tersimpan di riwayat pembelian Social Media",
    ],
  },
]

export default function TutorialLayananSocialMediaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" asChild className="mr-4 bg-transparent">
          <Link href="/tutorial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tutorial Layanan Social Media</h1>
          <p className="text-gray-600 mt-2">
            Panduan lengkap cara memesan layanan Social Media untuk media sosial Anda
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card key={step.number} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center">
                      <Icon className="h-6 w-6 mr-2 text-green-600" />
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
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Processing Time Info */}
      <Card className="mt-12 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-blue-800">
            <Clock className="h-6 w-6 mr-2" />
            Waktu Pemrosesan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-3">Estimasi Waktu:</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    <strong>Instagram Followers:</strong> 1-6 jam
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    <strong>Instagram Likes:</strong> 5-30 menit
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    <strong>YouTube Views:</strong> 1-24 jam
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    <strong>TikTok Followers:</strong> 2-12 jam
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-800 mb-3">Status Order:</h3>
              <ul className="space-y-2 text-blue-700">
                <li>
                  • <strong>Pending:</strong> Order sedang menunggu pembayaran
                </li>
                <li>
                  • <strong>Processing:</strong> Order sedang diproses
                </li>
                <li>
                  • <strong>Completed:</strong> Order selesai
                </li>
                <li>
                  • <strong>Failed:</strong> Order gagal diproses
                </li>
                <li>
                  • <strong>Cancelled:</strong> Order dibatalkan
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="mt-8 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-orange-800">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Penting untuk Diperhatikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Sebelum Memesan:</h3>
              <ul className="space-y-2 text-orange-700">
                <li>
                  • <strong>Akun tidak boleh private</strong> - Pastikan akun media sosial dapat diakses publik
                </li>
                <li>
                  • <strong>Username harus benar</strong> - Double check username atau link yang dimasukkan
                </li>
                <li>
                  • <strong>Jangan ubah username</strong> - Selama proses berlangsung, jangan ganti username
                </li>
                <li>
                  • <strong>Akun harus aktif</strong> - Pastikan akun tidak dalam status suspend atau banned
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Setelah Memesan:</h3>
              <ul className="space-y-2 text-orange-700">
                <li>• Cek status order secara berkala di riwayat Social Media</li>
                <li>• Jangan panic jika proses memakan waktu</li>
                <li>• Hubungi support jika order stuck lebih dari 24 jam</li>
                <li>• Simpan order ID untuk referensi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <Button asChild variant="outline">
          <Link href="/tutorial/pembelian-akun">Tutorial Akun Premium</Link>
        </Button>
        <Button asChild>
          <Link href="/services">Lihat Layanan Social Media</Link>
        </Button>
      </div>
    </div>
  )
}
