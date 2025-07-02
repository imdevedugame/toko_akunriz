"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, User, Mail, Phone, Lock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Update profil gagal")
      }

      setMessage("Profil berhasil diperbarui")
      await refreshUser()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Password baru tidak cocok")
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Update password gagal")
      }

      setMessage("Password berhasil diperbarui")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pengaturan Profil</h1>
          <p className="text-gray-600 text-sm sm:text-base">Kelola informasi akun dan keamanan Anda</p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* User Info Card */}
          <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Nama</Label>
                <p className="text-base sm:text-lg font-medium text-gray-900 mt-1">{user.name}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</Label>
                <p className="text-base sm:text-lg text-gray-900 mt-1 break-all">{user.email}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Role</Label>
                <div className="mt-2">
                  <Badge
                    variant={user.role === "admin" ? "destructive" : user.role === "reseller" ? "default" : "secondary"}
                    className={`${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : user.role === "reseller"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    } text-xs sm:text-sm px-3 py-1`}
                  >
                    {user.role === "admin" ? "Administrator" : user.role === "reseller" ? "Reseller" : "User"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-amber-200">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-sm sm:text-base"
                >
                  Edit Profil
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-sm sm:text-base"
                >
                  Ubah Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Edit Profil</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Perbarui informasi profil Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Nama Lengkap
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                          <Input
                            id="name"
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                            className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                            className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Nomor Telepon
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                            className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base px-6 py-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Perubahan"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Ubah Password</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Perbarui password untuk keamanan akun Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                          Password Saat Ini
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                            className="pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                          Password Baru
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                            className="pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                          Konfirmasi Password Baru
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            className="pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base px-6 py-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengubah...
                          </>
                        ) : (
                          "Ubah Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
