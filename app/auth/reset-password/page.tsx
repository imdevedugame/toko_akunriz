"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak valid atau tidak ditemukan")
      setTokenValid(false)
      return
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setTokenValid(true)
        } else {
          const data = await response.json()
          setError(data.error || "Token tidak valid atau sudah kedaluwarsa")
          setTokenValid(false)
        }
      } catch (error) {
        setError("Terjadi kesalahan saat memverifikasi token")
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 6) errors.push("Minimal 6 karakter")
    if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf besar")
    if (!/[a-z]/.test(password)) errors.push("Minimal 1 huruf kecil")
    if (!/[0-9]/.test(password)) errors.push("Minimal 1 angka")
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama")
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(`Password harus memenuhi: ${passwordErrors.join(", ")}`)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Terjadi kesalahan saat reset password")
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Memverifikasi token...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Token Tidak Valid</CardTitle>
            <CardDescription>Link reset password tidak valid atau sudah kedaluwarsa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Kemungkinan penyebab:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Link sudah kedaluwarsa (lebih dari 1 jam)</li>
                <li>Link sudah pernah digunakan</li>
                <li>Link tidak valid atau rusak</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={() => router.push("/auth/forgot-password")} className="w-full">
                Minta Link Baru
              </Button>
              <Button onClick={() => router.push("/auth/login")} variant="outline" className="w-full">
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Berhasil Direset!</CardTitle>
            <CardDescription>Password Anda telah berhasil diubah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password Anda telah berhasil direset. Sekarang Anda dapat login dengan password baru.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Tips Keamanan:</strong>
                <br />
                Pastikan untuk logout dari semua perangkat lain dan login ulang dengan password baru Anda.
              </p>
            </div>

            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Login Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordErrors = validatePassword(password)
  const isPasswordValid = password.length > 0 && passwordErrors.length === 0
  const isConfirmPasswordValid = confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
          <CardDescription>Masukkan password baru untuk akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {password.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className={password.length >= 6 ? "text-green-600" : "text-gray-500"}>
                      Minimal 6 karakter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                      Minimal 1 huruf besar
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                      Minimal 1 huruf kecil
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>Minimal 1 angka</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${isConfirmPasswordValid ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={isConfirmPasswordValid ? "text-green-600" : "text-red-600"}>
                    {isConfirmPasswordValid ? "Password cocok" : "Password tidak cocok"}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !isConfirmPasswordValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mereset Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
