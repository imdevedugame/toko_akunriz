import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Premium Store - Akun Premium & IndoSMM Services",
  description: "Toko online terpercaya untuk akun premium dan layanan IndoSMM",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full max-w-full">
            {/* Fixed Navbar */}
            <header className="sticky top-0 z-50 w-full">
              <Navbar />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-full overflow-x-hidden">
              <div className="w-full max-w-full">{children}</div>
            </main>

            {/* Footer */}
            <footer className="w-full mt-auto">
              <Footer />
            </footer>
          </div>
        </AuthProvider>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </body>
    </html>
  )
}
