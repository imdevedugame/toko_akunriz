"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FolderOpen,
  UserCheck,
  Globe,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Gift,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manajemen Produk",
    icon: Package,
    children: [
      {
        title: "Produk",
        href: "/admin/products",
        icon: Package,
      },
      {
        title: "Kategori",
        href: "/admin/categories",
        icon: FolderOpen,
      },
      {
        title: "Akun",
        href: "/admin/accounts",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Social Media Services",
    icon: Globe,
    children: [
      {
        title: "Social Categories",
        href: "/admin/social-categories",
        icon: FolderOpen,
      },
      {
        title: "Social Services",
        href: "/admin/social-services",
        icon: Globe,
      },
      {
        title: "Service Packages",
        href: "/admin/service-packages",
        icon: Gift,
      },
    ],
  },
  {
    title: "IndoSMM Services",
    icon: MessageSquare,
    children: [
      {
        title: "Services",
        href: "/admin/services",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Pesanan",
    icon: ShoppingCart,
    children: [
      {
        title: "Semua Pesanan",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "IndoSMM Orders",
        href: "/admin/indosmm-orders",
        icon: MessageSquare,
      },
      {
        title: "Social Media Orders",
        href: "/admin/social-orders",
        icon: Globe,
      },
    ],
  },
  {
    title: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Laporan",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Pengaturan",
    href: "/admin/manage",
    icon: Settings,
  },
]

interface SidebarContentProps {
  onItemClick?: () => void
}

function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Auto-expand parent menu if child is active
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => isActive(child.href))
        if (hasActiveChild && !expandedItems.includes(item.title)) {
          setExpandedItems((prev) => [...prev, item.title])
        }
      }
    })
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isExpanded = (title: string) => expandedItems.includes(title)

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const hasActiveChild = (children: any[]) => {
    return children.some((child) => isActive(child.href))
  }

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola sistem Anda</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {menuItems.map((item) => {
            if (item.children) {
              const expanded = isExpanded(item.title)
              const hasActive = hasActiveChild(item.children)

              return (
                <div key={item.title}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 px-3 text-left font-medium",
                      hasActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                    {expanded ? (
                      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />
                    )}
                  </Button>
                  {expanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                      {item.children.map((child) => (
                        <Button
                          key={child.href}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-9 px-3 text-sm font-normal",
                            isActive(child.href) && "bg-blue-100 text-blue-700 font-medium",
                          )}
                          asChild
                        >
                          <Link href={child.href} onClick={handleItemClick}>
                            <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{child.title}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-left font-medium",
                  isActive(item.href!) && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                )}
                asChild
              >
                <Link href={item.href!} onClick={handleItemClick}>
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-white border-r shadow-sm">
        <SidebarContent />
      </div>
    </>
  )
}

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild >
        <Button variant="ghost" size="sm" className="lg:hidden p-2 h-9 w-9" aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
