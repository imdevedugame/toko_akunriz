"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        setMessage("Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam.")
      } else {
        setError(data.error || "Terjadi kesalahan saat mengirim email reset password")
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Email Terkirim!</CardTitle>
            <CardDescription>Kami telah mengirim link reset password ke email Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Langkah selanjutnya:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Buka email Anda</li>
                <li>Cari email dari Vyloz Premium Zone</li>
                <li>Klik link "Reset Password"</li>
                <li>Buat password baru Anda</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Tidak menerima email?</strong>
                <br />
                Cek folder spam atau tunggu beberapa menit. Link berlaku selama 1 jam.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                  setMessage("")
                }}
                variant="outline"
                className="w-full"
              >
                Kirim Ulang Email
              </Button>
              <Button onClick={() => router.push("/auth/login")} className="w-full">
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Lupa Password?</CardTitle>
          <CardDescription>Masukkan email Anda dan kami akan mengirim link untuk reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Link Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Belum punya akun?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
