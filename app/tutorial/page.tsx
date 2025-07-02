"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShoppingCart, CheckCircle, TrendingUp, Play, Clock, BookOpen, Users } from "lucide-react"

const tutorials = [
  {
    id: "pembelian-akun",
    title: "Tutorial Pembelian Akun Premium",
    description: "Panduan lengkap cara membeli akun premium Netflix, Spotify, dan lainnya dengan aman dan mudah",
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    steps: 4,
    duration: "5 menit",
    difficulty: "Mudah",
  },
  {
    id: "layanan-indosmm",
    title: "Tutorial Layanan IndoSMM",
    description: "Cara memesan followers, likes, views untuk media sosial Anda dengan hasil terbaik",
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100",
    steps: 5,
    duration: "3 menit",
    difficulty: "Mudah",
  },
]

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Tutorial Penggunaan</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Pelajari cara menggunakan layanan kami dengan mudah melalui panduan step-by-step yang interaktif
          </p>
        </div>

        {/* Tutorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {tutorials.map((tutorial) => {
            const Icon = tutorial.icon
            return (
              <Card
                key={tutorial.id}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden"
              >
                <CardHeader className={`bg-gradient-to-r ${tutorial.bgColor} p-4 sm:p-6`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${tutorial.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                        {tutorial.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/80 text-gray-700 hover:bg-white/80 text-xs sm:text-sm"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {tutorial.steps} langkah
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-white/50 border-gray-300 text-gray-700 text-xs sm:text-sm"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {tutorial.duration}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm">
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-3">{tutorial.description}</p>
                  <Button
                    asChild
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
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

        {/* Quick Tips Section */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Tips Penting</CardTitle>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Ikuti panduan ini untuk pengalaman terbaik menggunakan layanan kami
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Premium Account Tips */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">Pembelian Akun Premium</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "Jangan ganti password akun yang sudah dibeli",
                    "Gunakan maksimal 1 device bersamaan",
                    "Logout setelah selesai menggunakan",
                    "Simpan data akun dengan aman",
                    "Laporkan masalah dalam 24 jam",
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-blue-800 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IndoSMM Tips */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">Layanan IndoSMM</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "Pastikan akun media sosial tidak private",
                    "Masukkan username/link dengan benar",
                    "Proses bisa memakan waktu 1-24 jam",
                    "Cek status order di riwayat pembelian",
                    "Hubungi support jika ada kendala",
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-green-800 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200">
              <div className="text-center">
                <h4 className="font-bold text-lg sm:text-xl text-amber-900 mb-2">Butuh Bantuan Lebih Lanjut?</h4>
                <p className="text-amber-800 text-sm sm:text-base mb-4">
                  Tim support kami siap membantu Anda 24/7 melalui berbagai channel komunikasi
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="bg-white hover:bg-amber-50 border-amber-300 text-amber-700">
                    <Users className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    FAQ Lengkap
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
