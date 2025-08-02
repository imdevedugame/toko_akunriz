import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vyloz Premium Zone - Pusat Digital Services | Akun Premium & Layanan Digital Terpercaya",
  description:
    "Vyloz Premium Zone adalah pusat layanan digital terpercaya untuk akun premium, layanan IndoSMM, followers, likes, views, dan kebutuhan digital marketing lainnya. Harga murah, proses cepat, dan bergaransi.",
  keywords: [
    "Vyloz Premium Zone",
    "Pusat Digital Services",
    "akun premium",
    "layanan digital",
    "followers",
    "likes",
    "views",
    "social media marketing",
    "jual akun premium",
    "beli followers",
    "digital marketing",
    "terpercaya",
    "murah",
    "cepat",
    "garansi",
  ],
  openGraph: {
    title: "Vyloz Premium Zone - Pusat Digital Services | Akun Premium & Layanan Digital Terpercaya",
    description:
      "Vyloz Premium Zone adalah pusat layanan digital terpercaya untuk akun premium, layanan IndoSMM, followers, likes, views, dan kebutuhan digital marketing lainnya. Harga murah, proses cepat, dan bergaransi.",
    url: "https://vylozzone.com", // Ganti dengan URL website Anda
    siteName: "Vyloz Premium Zone",
    images: [
      {
        url: "/Logo.png?height=630&width=1200", // Ganti dengan URL gambar banner Anda
        width: 1200,
        height: 630,
        alt: "Vyloz Premium Zone - Pusat Digital Services",
      },
    ],
    locale: "id_ID",
    type: "website",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        {/* JSON-LD Schema Markup for WebSite */}
        <meta name="google-site-verification" content="-NrYnWzoFNMGy6TM9zT67jOU-SAjE5Pm0vexWZnO6Sw" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Vyloz Premium Zone - Pusat Digital Services",
              url: "https://vylozzone.com", // Ganti dengan URL website Anda
              potentialAction: {
                "@type": "SearchAction",
                target: "https://vylozzone.com/products?search={search_term_string}", // Ganti dengan URL pencarian produk Anda
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* JSON-LD Schema Markup for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Vyloz Premium Zone",
              url: "https://vylozzone.com", // Ganti dengan URL website Anda
              logo: "/Logo.png?height=60&width=60", // Ganti dengan URL logo Anda
              sameAs: [
                "https://www.facebook.com/vylozpremiumzone", // Ganti dengan URL Facebook Anda
                "https://www.instagram.com/vylozpremiumzone", // Ganti dengan URL Instagram Anda
                "https://twitter.com/vylozpremiumzone", // Ganti dengan URL Twitter Anda
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
         <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </body>
    </html>
  )
}
