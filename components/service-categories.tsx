"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Music,
  Instagram,
  Youtube,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Phone
} from "lucide-react"
import Link from "next/link"

type BadgeType = keyof typeof badgeStyles

const categories: Array<{
  title: string
  icon: React.ElementType
  gradient: string
  bgGradient: string
  items: Array<{ name: string; popular: boolean; description: string }>
  href: string
  description: string
  totalServices: string
  badge: BadgeType
  features: Array<string>
}> = [
  {
    title: "Akun Premium",
    icon: Play,
    gradient: "from-red-500 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    items: [
      { name: "Netflix", popular: true, description: "Akun premium Netflix dengan kualitas 4K" },
      { name: "Disney+", popular: false, description: "Streaming Disney+ dengan konten eksklusif" },
      { name: "WeTV", popular: false, description: "Drama Asia terlengkap di WeTV" },
      { name: "Spotify", popular: true, description: "Musik premium tanpa iklan" },
      { name: "YouTube Premium", popular: false, description: "YouTube tanpa iklan + YouTube Music" },
    ],
    href: "/products/premium-accounts",
    description: "Akun premium berkualitas tinggi dengan garansi",
    totalServices: "20+ Layanan",
    badge: "Terlaris",
    features: ["Garansi Seumur Hidup", "Akun Private", "Support 24/7", "Kualitas Original"],
  },
  {
    title: "Instagram Services",
    icon: Instagram,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    items: [
      { name: "Followers Indonesia", popular: true, description: "Followers real dari Indonesia" },
      { name: "Likes Real", popular: true, description: "Likes organik dari user aktif" },
      { name: "Views Story", popular: false, description: "Boost views untuk Instagram Story" },
      { name: "Comments Custom", popular: false, description: "Komentar sesuai request Anda" },
    ],
    href: "/services/instagram",
    description: "Tingkatkan engagement Instagram Anda",
    totalServices: "15+ Layanan",
    badge: "Trending",
    features: ["Real User", "Gradual Delivery", "No Password Required", "Safe & Secure"],
  },
  {
    title: "YouTube Services",
    icon: Youtube,
    gradient: "from-red-600 to-red-500",
    bgGradient: "from-red-50 to-orange-50",
    items: [
      { name: "Subscribers Real", popular: true, description: "Subscriber aktif dan engaged" },
      { name: "Views Targeted", popular: true, description: "Views dari target audience" },
      { name: "Likes Organic", popular: false, description: "Likes natural dari viewer" },
      { name: "Watch Time", popular: false, description: "Tingkatkan jam tayang channel" },
    ],
    href: "/services/youtube",
    description: "Kembangkan channel YouTube Anda",
    totalServices: "12+ Layanan",
    badge: "Premium",
    features: ["High Retention", "Real Engagement", "Monetization Safe", "Analytics Friendly"],
  },
  {
    title: "TikTok Services",
    icon: Music,
    gradient: "from-black to-gray-800",
    bgGradient: "from-gray-50 to-slate-50",
    items: [
      { name: "Followers Aktif", popular: true, description: "Followers yang aktif berinteraksi" },
      { name: "Likes Viral", popular: true, description: "Likes untuk boost viral content" },
      { name: "Views Boost", popular: false, description: "Tingkatkan views video TikTok" },
      { name: "Shares Organic", popular: false, description: "Share organik untuk jangkauan luas" },
    ],
    href: "/services/tiktok",
    description: "Viral di TikTok dengan mudah",
    totalServices: "10+ Layanan",
    badge: "Hot",
    features: ["Viral Algorithm", "Real Interaction", "Fast Delivery", "Trend Optimization"],
  },
]

const badgeStyles = {
  Terlaris: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg",
  Trending: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
  Premium: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg",
  Hot: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg",
}

export function ServiceCategories() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  return (
    <div className="py-20 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-700 px-6 py-3 text-base font-semibold shadow-lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Layanan Terpopuler
        </Badge>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Kategori Layanan
        </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Pilih dari berbagai kategori layanan premium kami yang telah dipercaya oleh ribuan customer di seluruh
        Indonesia
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {categories.map((category, index) => {
        const Icon = category.icon
        const isExpanded = expandedCard === index

        return (
          <Card
            key={category.title}
            className={`group cursor-pointer transition-all duration-700 border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden relative animate-fade-in-up ${
          isExpanded
            ? "scale-105 shadow-2xl z-10 -translate-y-2"
            : "hover:shadow-2xl hover:-translate-y-2 hover:scale-102"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => toggleCard(index)}
          >
            {/* Animated Background */}
            <div
          className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} transition-opacity duration-500 ${
            isExpanded ? "opacity-60" : "opacity-20 group-hover:opacity-40"
          }`}
            ></div>
            <div
          className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/20 rounded-full blur-2xl transition-transform duration-700 ${
            isExpanded ? "scale-150" : "group-hover:scale-150"
          }`}
            ></div>

            <CardHeader className="relative pb-4 pt-8">
          <div className="flex items-start justify-between mb-6">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-xl transition-all duration-500 ${
            isExpanded ? "scale-110 rotate-12" : "group-hover:scale-110 group-hover:rotate-12"
              }`}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
            <Badge
              className={`${badgeStyles[category.badge]} font-bold px-4 py-2 text-sm ${
            isExpanded ? "" : "animate-pulse group-hover:animate-none"
              }`}
            >
              {category.badge}
            </Badge>
          </div>

          <div>
            <h3
              className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
            isExpanded ? "text-amber-700" : "text-gray-900 group-hover:text-amber-700"
              }`}
            >
              {category.title}
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-amber-600 font-semibold">
            <TrendingUp className="h-4 w-4 mr-2" />
            {category.totalServices}
              </div>
              <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
            <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
            </CardHeader>

            {/* Expandable Content */}
            <div
          className={`transition-all duration-500 overflow-hidden ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
            >
          <CardContent className="relative pt-0 pb-6">
            {/* Features List */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">✨ Keunggulan:</h4>
              <div className="grid grid-cols-2 gap-2">
            {category.features.map((feature, featureIndex) => (
              <div
                key={feature}
                className="flex items-center text-sm text-gray-600 animate-fade-in-up"
                style={{ animationDelay: `${featureIndex * 0.1}s` }}
              >
                <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-2"></div>
                {feature}
              </div>
            ))}
              </div>
            </div>

            {/* Services List */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Layanan Populer:</h4>
              <div className="space-y-3">
            {category.items.slice(0, 3).map((item, itemIndex) => (
              <div
                key={item.name}
                className="flex items-start space-x-3 p-3 rounded-lg bg-white/70 hover:bg-white/90 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${itemIndex * 0.1}s` }}
              >
                <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                {item.popular && <Crown className="h-3 w-3 ml-2 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              asChild
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 text-base transform hover:scale-105 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={category.href} className="flex items-center justify-center">
            <Zap className="h-5 w-5 mr-2" />
            Lihat Semua Layanan
            <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
            </div>

            {/* Collapsed State Content */}
            {!isExpanded && (
          <CardContent className="relative pt-0 pb-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Klik untuk melihat detail layanan</p>
              <div className="flex items-center justify-center space-x-2">
            {category.items
              .filter((item) => item.popular)
              .map((item, index) => (
                <Badge key={item.name} variant="secondary" className="text-xs bg-amber-100 text-amber-700">
              {item.name}
                </Badge>
              ))}
              </div>
            </div>
          </CardContent>
            )}

            {/* Enhanced Hover Effect Overlay */}
            <div
          className={`absolute inset-0 bg-gradient-to-t from-amber-600/5 via-orange-600/5 to-transparent transition-opacity duration-500 pointer-events-none ${
            isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
            ></div>
          </Card>
        )
          })}
        </div>

        {/* Enhanced Bottom CTA Section */}
        <div className="relative">
          <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white border-0 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

        <CardContent className="py-12 px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold">
            <Star className="h-4 w-4 mr-2" />
            Customer Service 24/7
          </Badge>
            </div>

            <h3 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Tidak Menemukan Yang Anda Cari?
            </h3>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          Hubungi tim customer service kami untuk konsultasi layanan custom sesuai kebutuhan Anda. Kami siap
          membantu 24/7 dengan respon cepat dan solusi terbaik.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat Customer Service
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white bg-transparent font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Phone className="h-5 w-5 mr-2" />
            Hubungi Kami
          </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 mt-8 pt-8 border-t border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-sm text-gray-400">Guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">10K+</div>
            <div className="text-sm text-gray-400">Happy Clients</div>
          </div>
            </div>
          </div>
        </CardContent>
          </Card>
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
