"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Headphones,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Users,
  Globe,
  Heart,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert("Pesan Anda telah terkirim! Kami akan merespons dalam 1x24 jam.")
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    })
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: "rivaz.store15@gmail.com",
      description: "Kirim email untuk pertanyaan umum",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: Phone,
      title: "WhatsApp",
      value: "+62 812-3456-7890",
      description: "Chat langsung untuk bantuan cepat",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: MapPin,
      title: "Lokasi",
      value: "Jakarta, Indonesia",
      description: "Kantor pusat kami",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      value: "24/7 Online",
      description: "Sistem otomatis tersedia sepanjang waktu",
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ]

  const faqItems = [
    {
      question: "Bagaimana cara melakukan pembayaran?",
      answer:
        "Kami menerima pembayaran melalui berbagai metode termasuk bank transfer, e-wallet (OVO, DANA, GoPay), virtual account, dan QRIS. Semua pembayaran diproses secara aman melalui gateway pembayaran terpercaya.",
      category: "Pembayaran",
    },
    {
      question: "Berapa lama proses pengiriman akun premium?",
      answer:
        "Akun premium akan dikirim secara otomatis dalam hitungan detik hingga 5 menit setelah pembayaran berhasil dikonfirmasi. Untuk layanan SMM, proses membutuhkan waktu 1-24 jam tergantung jenis layanan.",
      category: "Pengiriman",
    },
    {
      question: "Apakah ada garansi untuk produk yang dibeli?",
      answer:
        "Ya, kami memberikan garansi replacement 24 jam untuk akun premium jika terjadi masalah. Untuk layanan SMM, kami memberikan garansi refill sesuai dengan ketentuan masing-masing layanan.",
      category: "Garansi",
    },
    {
      question: "Bagaimana cara menjadi reseller?",
      answer:
        "Untuk menjadi reseller, Anda perlu menghubungi customer service kami melalui WhatsApp. Syarat menjadi reseller antara lain: deposit minimal, komitmen penjualan, dan verifikasi identitas.",
      category: "Reseller",
    },
    {
      question: "Apakah akun premium yang dibeli aman digunakan?",
      answer:
        "Semua akun premium yang kami jual adalah akun legal dan aman digunakan. Kami tidak menjual akun hasil hack atau ilegal. Namun, pastikan untuk mengikuti panduan penggunaan yang kami berikan.",
      category: "Keamanan",
    },
    {
      question: "Bagaimana cara mengecek status pesanan?",
      answer:
        "Anda dapat mengecek status pesanan melalui halaman 'Riwayat Pesanan' setelah login ke akun Anda. Kami juga akan mengirim notifikasi email untuk setiap update status pesanan.",
      category: "Pesanan",
    },
  ]

  const features = [
    {
      icon: Shield,
      title: "100% Aman",
      description: "Transaksi terjamin dengan sistem keamanan berlapis",
      color: "text-blue-600",
    },
    {
      icon: Zap,
      title: "Proses Cepat",
      description: "Pengiriman otomatis dalam hitungan detik",
      color: "text-yellow-600",
    },
    {
      icon: Users,
      title: "Support 24/7",
      description: "Tim customer service siap membantu kapan saja",
      color: "text-green-600",
    },
    {
      icon: Award,
      title: "Terpercaya",
      description: "Dipercaya oleh ribuan pelanggan di Indonesia",
      color: "text-purple-600",
    },
  ]

  const stats = [
    { number: "10K+", label: "Pelanggan Puas", icon: Users },
    { number: "99.9%", label: "Uptime Server", icon: Globe },
    { number: "24/7", label: "Customer Support", icon: Headphones },
    { number: "4.9", label: "Rating Pelanggan", icon: Star },
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
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6 shadow-lg">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ada pertanyaan atau butuh bantuan? Tim customer service profesional kami siap membantu Anda dengan pelayanan
            terbaik 24/7.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="text-center border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Enhanced Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  Kirim Pesan Kepada Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama lengkap Anda"
                        className="h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Alamat Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Kategori Pertanyaan *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="h-12 border-gray-200 focus:border-amber-500">
                          <SelectValue placeholder="Pilih kategori pertanyaan" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="general">Pertanyaan Umum</SelectItem>
                          <SelectItem value="technical">Masalah Teknis</SelectItem>
                          <SelectItem value="payment">Pembayaran</SelectItem>
                          <SelectItem value="account">Masalah Akun</SelectItem>
                          <SelectItem value="reseller">Program Reseller</SelectItem>
                          <SelectItem value="complaint">Keluhan & Saran</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Subjek Pesan *
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Ringkasan singkat masalah Anda"
                        className="h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Pesan Detail *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Jelaskan pertanyaan atau masalah Anda secara detail. Semakin detail informasi yang Anda berikan, semakin cepat kami dapat membantu menyelesaikan masalah Anda."
                      rows={6}
                      className="border-gray-200 focus:border-amber-500 focus:ring-amber-500 resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Mengirim Pesan...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Kirim Pesan Sekarang
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Contact Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Headphones className="h-5 w-5 mr-2" />
                  Informasi Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-3 ${info.color} rounded-xl shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                        <p className={`font-semibold ${info.textColor} mb-1`}>{info.value}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Jam Layanan Customer Service
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Senin - Jumat</span>
                    <Badge className="bg-blue-500 text-white">09:00 - 21:00</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Sabtu - Minggu</span>
                    <Badge className="bg-purple-500 text-white">10:00 - 18:00</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-gray-700">Sistem Otomatis</span>
                    <Badge className="bg-green-500 text-white">24/7 Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Mengapa Memilih Kami?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className={`h-4 w-4 ${feature.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan yang paling sering ditanyakan oleh pelanggan kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <Card
                key={index}
                className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-gray-900">{item.question}</span>
                    </div>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <div className="pl-11">
                      <Badge className="mb-3 bg-blue-100 text-blue-800 text-xs">{item.category}</Badge>
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden">
            <CardContent className="p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/20"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Phone className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Butuh Bantuan Segera?</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-lg">
                  Tim customer service profesional kami siap membantu Anda melalui WhatsApp untuk respon yang lebih
                  cepat dan personal. Dapatkan solusi instan untuk semua kebutuhan Anda!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    Chat WhatsApp Sekarang
                  </Button>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Respon dalam 5 menit</span>
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
