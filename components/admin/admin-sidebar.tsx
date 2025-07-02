import { BarChart3, FileText, Key, LayoutDashboard, Package, Settings, ShoppingCart, Tag, Users } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/components/sidebar-nav"
import { TrendingUp } from "lucide-react"

interface DashboardSidebarProps {
  isMobile: boolean
}

export function DashboardSidebar({ isMobile }: DashboardSidebarProps) {
  // Add these items to the admin navigation
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Manage",
      href: "/admin/manage",
      icon: Settings,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
    },
    {
      name: "Account Inventory",
      href: "/admin/accounts",
      icon: Key,
    },
    {
      name: "IndoSMM Services",
      href: "/admin/services",
      icon: TrendingUp,
    },
    {
      name: "All Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "IndoSMM Orders",
      href: "/admin/indosmm-orders",
      icon: BarChart3,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Reports & Analytics",
      href: "/admin/reports",
      icon: FileText,
    },
  ]

  return (
      <div className="flex flex-col px-2 py-4 min-w-[220px]">
      <MainNav className="flex flex-col mb-2" />
      <div className="flex-1 space-y-1">
        {navigation.map((item) => (
          <SidebarNavItem key={item.name} title={item.name} href={item.href} icon={item.icon} />
        ))}
      </div>
    </div>
  )
}
