"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Shield,
  Crown,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Package,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Package,
      title: "Akses Akun Premium",
      description: "Netflix, Spotify, Disney+, dan lainnya",
    },
    {
      icon: Star,
      title: "Layanan SMM Terbaik",
      description: "Tingkatkan engagement media sosial",
    },
    {
      icon: Shield,
      title: "Transaksi Aman",
      description: "Pembayaran terjamin 100% aman",
    },
    {
      icon: Users,
      title: "Support 24/7",
      description: "Tim support siap membantu kapan saja",
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
        {/* Left Side - Login Form */}
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
              <p className="text-gray-600 text-sm">Platform digital terpercaya #1 di Indonesia</p>
            </div>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Masuk ke Akun</CardTitle>
                <CardDescription className="text-gray-600">
                  Masukkan email dan password untuk mengakses akun Anda
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
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Alamat Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
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
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sedang Masuk...
                      </>
                    ) : (
                      <>
                        Masuk Sekarang
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

                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Belum punya akun?{" "}
                      <Link
                        href="/auth/register"
                        className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors"
                      >
                        Daftar sekarang
                      </Link>
                    </p>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors block"
                    >
                      Lupa password?
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-600 flex items-center justify-center">
                        <Crown className="h-4 w-4 mr-2 text-amber-500" />
                        Login sebagai Admin?
                      </p>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 font-semibold bg-transparent"
                      >
                        <Link href="/auth/admin-login">
                          <Shield className="h-4 w-4 mr-2" />
                          Login Admin
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-green-500" />
                  <span>SSL Secure</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  <span>Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-8">
          <div className="max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami?</h2>
              <p className="text-gray-600">Bergabunglah dengan ribuan pelanggan yang sudah mempercayai layanan kami</p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-green-800 mb-2">Terpercaya & Aman</h3>
                <p className="text-sm text-green-600">
                  Lebih dari 10,000+ pelanggan telah mempercayai layanan kami dengan rating 4.9/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Benefits Section */}
      <div className="lg:hidden px-4 pb-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Mengapa Memilih Kami?</h2>
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="border-0 shadow-md bg-white/80 backdrop-blur-sm text-center">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
