"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Package, Key, Tag, Users, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface ManageStats {
  products: number
  categories: number
  accounts: number
  services: number
  users: number
  orders: number
}

export default function AdminManagePage() {
  const [stats, setStats] = useState<ManageStats>({
    products: 0,
    categories: 0,
    accounts: 0,
    services: 0,
    users: 0,
    orders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/manage/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const manageItems = [
    {
      title: "Products",
      description: "Manage premium account products",
      icon: Package,
      href: "/admin/products",
      count: stats.products,
      color: "bg-blue-500",
    },
    {
      title: "Categories",
      description: "Organize products into categories",
      icon: Tag,
      href: "/admin/categories",
      count: stats.categories,
      color: "bg-green-500",
    },
    {
      title: "Account Inventory",
      description: "Manage premium account stock",
      icon: Key,
      href: "/admin/accounts",
      count: stats.accounts,
      color: "bg-purple-500",
    },
    {
      title: "IndoSMM Services",
      description: "Manage social media services",
      icon: TrendingUp,
      href: "/admin/services",
      count: stats.services,
      color: "bg-orange-500",
    },
    {
      title: "Users",
      description: "Manage customers and resellers",
      icon: Users,
      href: "/admin/users",
      count: stats.users,
      color: "bg-red-500",
    },
    {
      title: "Orders",
      description: "View and manage all orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      count: stats.orders,
      color: "bg-indigo-500",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage</h1>
          <p className="text-gray-600">Manage all aspects of your business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage</h1>
        <p className="text-gray-600">Manage all aspects of your business from one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manageItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={item.href}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-semibold">
                      {item.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/products">
                <Package className="h-8 w-8" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/accounts">
                <Key className="h-8 w-8" />
                <span>Add Accounts</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/services">
                <TrendingUp className="h-8 w-8" />
                <span>Sync Services</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/reports">
                <BarChart3 className="h-8 w-8" />
                <span>View Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
