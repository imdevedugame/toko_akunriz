"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut, Settings, History, Package, Crown, Shield, Star } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Layanan", href: "/services" },
    { name: "Tutorial", href: "/tutorial" },
    { name: "Tentang", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600 text-white"
      case "reseller":
        return "bg-purple-500 hover:bg-purple-600 text-white"
      default:
        return "bg-blue-500 hover:bg-blue-600 text-white"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Crown
      case "reseller":
        return Star
      default:
        return Shield
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors duration-200">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 hidden sm:block">
                <span className="text-xl font-bold text-gray-900">PremiumStore</span>
                <div className="text-xs text-gray-500">Trusted Digital Services</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Badge - Hidden on small screens */}
                <div className="hidden md:block">
                  <Badge
                    className={`${getRoleBadgeStyle(user.role)} font-medium px-3 py-1 transition-colors duration-200`}
                  >
                    {(() => {
                      const IconComponent = getRoleIcon(user.role)
                      return <IconComponent className="h-3 w-3 mr-1" />
                    })()}
                    {user.role === "admin" ? "Admin" : user.role === "reseller" ? "Reseller" : "User"}
                  </Badge>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200 px-3 py-2"
                    >
                      <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden sm:block font-medium text-gray-800 max-w-24 truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg"
                  >
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <Badge className={`${getRoleBadgeStyle(user.role)} text-xs px-2 py-0.5 mt-1`}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="p-2">
                      <Link href="/history" className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <History className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>Riwayat Pesanan</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-2">
                      <Link href="/profile" className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Settings className="h-4 w-4 text-purple-600" />
                        </div>
                        <span>Pengaturan Profil</span>
                      </Link>
                    </DropdownMenuItem>

                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="p-2">
                          <Link href="/admin" className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                              <Crown className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="text-red-700">Panel Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="p-2 cursor-pointer">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                          <LogOut className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-red-700">Keluar</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  asChild
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 font-medium text-gray-800 rounded-lg transition-colors duration-200"
                >
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Link href="/auth/register">Daftar</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200"
                >
                  <Menu className="h-5 w-5 text-gray-800" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white border-l border-gray-200">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-center pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <span className="text-xl font-bold text-gray-900">PremiumStore</span>
                      <div className="text-xs text-gray-500">Trusted Digital Services</div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                            isActive ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Mobile User Section */}
                  {user && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          </div>
                        </div>
                        <Badge className={`${getRoleBadgeStyle(user.role)} font-medium px-3 py-1`}>
                          {(() => {
                            const IconComponent = getRoleIcon(user.role)
                            return <IconComponent className="h-3 w-3 mr-1" />
                          })()}
                          {user.role}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href="/history"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <History className="h-5 w-5 text-blue-600" />
                          <span>Riwayat Pesanan</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Settings className="h-5 w-5 text-purple-600" />
                          <span>Pengaturan Profil</span>
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-700 hover:bg-red-50 transition-colors duration-200"
                          >
                            <Crown className="h-5 w-5 text-red-600" />
                            <span>Panel Admin</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-700 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="h-5 w-5 text-red-600" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Auth Buttons */}
                  {!user && (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 font-medium text-gray-800 rounded-lg"
                      >
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          Masuk
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg"
                      >
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                          Daftar
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
