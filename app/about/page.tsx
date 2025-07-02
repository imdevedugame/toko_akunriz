"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Zap,
  Users,
  Award,
  CheckCircle,
  Star,
  Heart,
  Target,
  Lightbulb,
  TrendingUp,
  Globe,
  Handshake,
  Crown,
  Rocket,
  Building,
  Calendar,
  ArrowRight,
} from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: "100% Aman & Terpercaya",
      description: "Pembayaran melalui Xendit yang sudah terintegrasi dengan berbagai bank dan e-wallet di Indonesia.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Zap,
      title: "Proses Otomatis",
      description: "Sistem otomatis yang memproses pesanan Anda dalam hitungan detik setelah pembayaran berhasil.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: Users,
      title: "Sistem Reseller",
      description: "Program reseller dengan harga khusus dan keuntungan menarik untuk mitra bisnis kami.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Award,
      title: "Kualitas Terjamin",
      description: "Semua akun premium dan layanan IndoSMM telah melalui quality control yang ketat.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ]

  const stats = [
    { label: "Pelanggan Puas", value: "10,000+", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Akun Terjual", value: "50,000+", icon: CheckCircle, color: "from-green-500 to-emerald-600" },
    { label: "Rating Kepuasan", value: "4.9/5", icon: Star, color: "from-yellow-500 to-orange-500" },
    { label: "Uptime Server", value: "99.9%", icon: Zap, color: "from-purple-500 to-purple-600" },
  ]

  const timeline = [
    {
      year: "2020",
      title: "Berdiri",
      description: "Premium Store didirikan dengan visi menyediakan akun premium berkualitas tinggi.",
      icon: Building,
      color: "from-blue-500 to-blue-600",
    },
    {
      year: "2021",
      title: "Ekspansi Layanan",
      description: "Menambahkan layanan IndoSMM untuk memenuhi kebutuhan social media marketing.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
    },
    {
      year: "2022",
      title: "Sistem Reseller",
      description: "Meluncurkan program reseller untuk memperluas jangkauan bisnis.",
      icon: Handshake,
      color: "from-purple-500 to-purple-600",
    },
    {
      year: "2023",
      title: "Integrasi Payment",
      description: "Mengintegrasikan Xendit untuk pembayaran yang lebih mudah dan aman.",
      icon: Shield,
      color: "from-orange-500 to-red-500",
    },
    {
      year: "2024",
      title: "Platform Terbaru",
      description: "Meluncurkan platform baru dengan fitur yang lebih lengkap dan user-friendly.",
      icon: Rocket,
      color: "from-amber-500 to-orange-600",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Integritas",
      description: "Kami berkomitmen untuk selalu jujur dan transparan dalam setiap layanan yang kami berikan.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      title: "Kepuasan Pelanggan",
      description: "Kepuasan pelanggan adalah prioritas utama kami dalam mengembangkan layanan.",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Lightbulb,
      title: "Inovasi",
      description: "Kami terus berinovasi untuk memberikan pengalaman terbaik bagi pengguna.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
  ]

  const achievements = [
    {
      icon: Crown,
      title: "Platform Terpercaya #1",
      description: "Dipercaya sebagai platform akun premium terbaik di Indonesia",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: Globe,
      title: "Jangkauan Nasional",
      description: "Melayani pelanggan di seluruh Indonesia dengan kualitas terbaik",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Tingkat Kepuasan 99%",
      description: "Mencapai tingkat kepuasan pelanggan yang sangat tinggi",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-300/10 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6 shadow-lg">
            <Building className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
            Tentang Premium Store
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Kami adalah platform terpercaya yang menyediakan akun premium dan layanan IndoSMM berkualitas tinggi dengan
            sistem pembayaran yang aman dan proses yang cepat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Mulai Berbelanja
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold px-8 py-3 bg-transparent"
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami memberikan layanan terbaik dengan berbagai keunggulan yang membuat kami berbeda dari yang lain
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${feature.bgColor} rounded-xl shadow-md`}>
                        <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Enhanced Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl sm:text-2xl">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Menjadi platform terdepan di Indonesia dalam menyediakan akun premium dan layanan digital marketing yang
                berkualitas tinggi, terpercaya, dan terjangkau untuk semua kalangan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl sm:text-2xl">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                Misi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Memberikan layanan berkualitas tinggi dengan harga terjangkau</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Membangun kepercayaan melalui transparansi dan keamanan</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Mendukung pertumbuhan bisnis digital di Indonesia</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Memberikan pengalaman pelanggan yang luar biasa</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Achievements Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Pencapaian Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai pencapaian yang membanggakan dalam perjalanan kami melayani pelanggan
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-gray-900">{achievement.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Enhanced Timeline */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perjalanan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Melihat kembali perjalanan dan milestone penting dalam pengembangan Premium Store
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {timeline.map((item, index) => {
              const Icon = item.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-4 sm:flex-col sm:space-x-0 sm:space-y-3 sm:text-center">
                        <div
                          className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${item.color} text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md`}
                        >
                          {item.year}
                        </div>
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-md`}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Enhanced Values */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-16">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl sm:text-3xl text-center flex items-center justify-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              Nilai-Nilai Kami
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden">
            <CardContent className="p-8 sm:p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/20"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Handshake className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Bergabunglah Dengan Kami</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
                  Rasakan pengalaman berbelanja akun premium dan layanan SMM terbaik. Bergabunglah dengan ribuan
                  pelanggan yang sudah mempercayai kami!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Crown className="h-5 w-5 mr-3" />
                    Mulai Berbelanja
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 font-bold px-8 py-4 text-lg bg-transparent"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Jadi Reseller
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Gratis Konsultasi</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Support 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Garansi Terpercaya</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
