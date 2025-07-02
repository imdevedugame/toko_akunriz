"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface Account {
  id: number
  product_id: number
  product_name: string
  email: string
  password: string
  status: string
  sold_at: string | null
  created_at: string
}

interface AccountViewModalProps {
  account: Account
  isOpen: boolean
  onClose: () => void
}

export function AccountViewModal({ account, isOpen, onClose }: AccountViewModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "sold":
        return "secondary"
      case "reserved":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Account Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {account.product_name}
                <Badge variant={getStatusColor(account.status)}>{account.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded">{account.email}</code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(account.email)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Password</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded">
                    {showPassword ? account.password : "*".repeat(account.password.length)}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(account.password)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p>{new Date(account.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                {account.sold_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sold Date</label>
                    <p>{new Date(account.sold_at).toLocaleDateString("id-ID")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
