"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Users, CheckCircle, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <>
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        <div className="relative">
          {/* Main Hero Section */}
          <div className="container mx-auto px-4 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Logo & Brand */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">PS</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">PremiumStore</h2>
                    <p className="text-sm text-gray-600">Trusted Digital Services</p>
                  </div>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      #1 Terpercaya
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Store
                    </Badge>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Pusat Premium Aplikasi &{" "}
                    </span>
                    <span className="text-black">Layanan Social Media Injection</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Nikmati Akses Layanan Premium Aplikasi & Suntik Sosial Media Berkualitas Tinggi dengan Harga
                    Terjangkau. Ribuan Pelanggan Puas & Reseller Telah Membuktikan — Solusi Cerdasmu untuk kebutuhan
                    Hiburan, Tugas, Personal Branding, atau Bisnismu.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    🛒 Belanja Sekarang
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-amber-600 hover:text-amber-600 px-8 py-3 text-lg font-semibold bg-transparent transition-all transform hover:scale-105"
                  >
                    📋 Lihat Katalog
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">10K+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <div className="text-sm text-gray-600">Premium Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Order Otomatis</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Enhanced Feature Cards */}
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Card 1 - Enhanced with floating animation */}
                  <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up hover:rotate-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start space-x-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
                          <Shield className="h-7 w-7 text-green-600 group-hover:text-green-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-800 transition-colors">
                            100% Aman & Terpercaya
                          </h3>
                          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                            Pembayaran melalui gateway resmi Xendit dengan enkripsi SSL. Garansi uang kembali jika tidak
                            sesuai.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 - Enhanced with pulse effect */}
                  <Card
                    className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up hover:-rotate-1 relative overflow-hidden"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start space-x-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:animate-pulse">
                          <Zap className="h-7 w-7 text-amber-600 group-hover:text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-800 transition-colors">
                            Proses Otomatis & Cepat
                          </h3>
                          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                            Akun premium langsung dikirim ke email Anda dalam hitungan menit setelah pembayaran
                            berhasil.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3 - Enhanced with glow effect */}
                  <Card
                    className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up hover:rotate-1 relative overflow-hidden"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start space-x-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-purple-200">
                          <Users className="h-7 w-7 text-purple-600 group-hover:text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-800 transition-colors">
                            Program Reseller Menguntungkan
                          </h3>
                          <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                            Dapatkan harga khusus dan komisi menarik untuk reseller. Daftar gratis dan mulai bisnis
                            Anda!
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* New floating stats card */}
                <Card
                  className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                          ⚡
                        </div>
                        <div className="text-sm opacity-80">Instant Delivery</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                          🔒
                        </div>
                        <div className="text-sm opacity-80">Secure Payment</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                          💎
                        </div>
                        <div className="text-sm opacity-80">Premium Quality</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  )
}
