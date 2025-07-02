"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Package,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Users,
  Gift,
  Zap,
  TrendingUp,
  Heart,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user", // Fixed to user only
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      })
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Registrasi gagal")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Package,
      title: "Akses Semua Produk",
      description: "Netflix, Spotify, Disney+, dan platform premium lainnya",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Layanan SMM Terbaik",
      description: "Tingkatkan followers, likes, dan engagement media sosial",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Transaksi 100% Aman",
      description: "Pembayaran terjamin dengan sistem keamanan berlapis",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Zap,
      title: "Proses Instan",
      description: "Pengiriman otomatis dalam hitungan detik",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Support 24/7",
      description: "Tim customer service siap membantu kapan saja",
      color: "from-pink-500 to-red-500",
    },
    {
      icon: Heart,
      title: "Harga Terjangkau",
      description: "Dapatkan akun premium dengan harga terbaik",
      color: "from-indigo-500 to-purple-500",
    },
  ]

  const features = [
    {
      icon: CheckCircle,
      title: "Garansi Penggantian",
      description: "Jaminan penggantian jika ada masalah dalam 24 jam",
    },
    {
      icon: Star,
      title: "Rating 4.9/5",
      description: "Dipercaya oleh lebih dari 10,000+ pelanggan",
    },
    {
      icon: Shield,
      title: "Data Terlindungi",
      description: "Privasi dan keamanan data pelanggan terjamin",
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

      <div className="relative flex min-h-screen">
        {/* Left Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Premium Store
              </h1>
              <p className="text-gray-600 text-sm">Bergabunglah dengan ribuan pelanggan setia kami</p>
            </div>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Buat Akun Baru</CardTitle>
                <CardDescription className="text-gray-600">
                  Daftar untuk mulai berbelanja akun premium dan layanan IndoSMM terbaik
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Alamat Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Nomor Telepon
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Konfirmasi Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sedang Mendaftar...
                      </>
                    ) : (
                      <>
                        Daftar Sekarang
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">atau</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Sudah punya akun?{" "}
                      <Link
                        href="/auth/login"
                        className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors"
                      >
                        Masuk sekarang
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-green-500" />
                  <span>Data Aman</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Gratis Daftar</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  <span>Terpercaya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-8">
          <div className="max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bergabunglah Dengan Kami</h2>
              <p className="text-gray-600">
                Dapatkan akses ke ribuan akun premium dan layanan SMM terbaik dengan harga terjangkau
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <CardContent className="p-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${benefit.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{benefit.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bonus Section */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-green-800 mb-2">Bonus Pendaftaran</h3>
                <p className="text-sm text-green-600 mb-3">
                  Dapatkan bonus saldo Rp 5.000 untuk pembelian pertama Anda!
                </p>
                <Badge className="bg-green-500 text-white text-xs px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Terbatas!
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Benefits Section */}
      <div className="lg:hidden px-4 pb-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Keuntungan Bergabung</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {benefits.slice(0, 4).map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm text-center">
                  <CardContent className="p-4">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${benefit.color} rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Mobile Bonus Section */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-green-800 mb-1">Bonus Pendaftaran</h3>
            <p className="text-sm text-green-600">Bonus saldo Rp 5.000 untuk member baru!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
