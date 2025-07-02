import { Suspense } from "react"
import { ProductGrid } from "@/components/product-grid"
import { HeroSection } from "@/components/hero-section"
import { ServiceCategories } from "@/components/service-categories"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <ServiceCategories />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Akun Premium Terpopuler</h2>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  )
}
