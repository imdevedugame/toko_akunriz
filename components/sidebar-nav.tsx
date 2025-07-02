"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavItemProps {
  title: string
  href: string
  icon: LucideIcon
}

export function SidebarNavItem({ title, href, icon: Icon }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))

  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        isActive && "bg-muted font-medium"
      )}
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </Link>
    </Button>
  )
}

interface SidebarNavProps {
  items: {
    title: string
    href: string
    icon: LucideIcon
  }[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <div className="flex flex-col space-y-1">
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          title={item.title}
          href={item.href}
          icon={item.icon}
        />
      ))}
    </div>
  )
}
