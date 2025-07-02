import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShoppingCart, CheckCircle, TrendingUp, Play } from "lucide-react"

const tutorials = [
  {
    id: "pembelian-akun",
    title: "Tutorial Pembelian Akun Premium",
    description: "Panduan lengkap cara membeli akun premium Netflix, Spotify, dan lainnya",
    icon: ShoppingCart,
    color: "bg-blue-500",
    steps: 4,
    duration: "5 menit",
  },
  {
    id: "layanan-indosmm",
    title: "Tutorial Layanan IndoSMM",
    description: "Cara memesan followers, likes, views untuk media sosial Anda",
    icon: TrendingUp,
    color: "bg-green-500",
    steps: 5,
    duration: "3 menit",
  },
]

export default function TutorialPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tutorial Penggunaan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Pelajari cara menggunakan layanan kami dengan mudah melalui panduan step-by-step
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon
          return (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${tutorial.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{tutorial.steps} langkah</Badge>
                      <Badge variant="outline">{tutorial.duration}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tutorial.description}</p>
                <Button asChild className="w-full">
                  <Link href={`/tutorial/${tutorial.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Mulai Tutorial
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tips Penting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                Pembelian Akun Premium
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Jangan ganti password akun yang sudah dibeli
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Gunakan maksimal 1 device bersamaan
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Logout setelah selesai menggunakan
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Simpan data akun dengan aman
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Layanan IndoSMM
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Pastikan akun media sosial tidak private
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Masukkan username/link dengan benar
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Proses bisa memakan waktu 1-24 jam
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Cek status order di riwayat pembelian
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
