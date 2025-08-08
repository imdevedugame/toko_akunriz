"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Eye, EyeOff, Users } from "lucide-react"
import { useState, useEffect } from "react"

interface Account {
  id: number
  product_id: number
  product_name: string
  email: string
  password: string
  status: string
  sold_at: string | null
  created_at: string
  duplicate_group_id: string | null
  duplicate_count: number
  original_account_id: number | null
  duplicate_index: number
}

interface DuplicateStats {
  total: number
  available: number
  reserved: number
  sold: number
  duplicates: Array<{
    id: number
    status: string
    duplicate_index: number
    sold_at: string | null
  }>
}

interface AccountViewModalProps {
  account: Account
  isOpen: boolean
  onClose: () => void
}

export function AccountViewModal({ account, isOpen, onClose }: AccountViewModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [duplicateStats, setDuplicateStats] = useState<DuplicateStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  useEffect(() => {
    if (isOpen && account.duplicate_group_id) {
      fetchDuplicateStats()
    }
  }, [isOpen, account.duplicate_group_id])

  const fetchDuplicateStats = async () => {
    if (!account.duplicate_group_id) return

    setIsLoadingStats(true)
    try {
      const response = await fetch(`/api/admin/accounts/duplicate-stats/${account.duplicate_group_id}`)
      if (response.ok) {
        const data = await response.json()
        setDuplicateStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch duplicate stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

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
      <DialogContent className=" bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Account Details</span>
            {account.duplicate_group_id && (
              <Badge variant="outline" className="ml-2">
                {account.original_account_id ? `Duplicate #${account.duplicate_index}` : "Original"}
              </Badge>
            )}
          </DialogTitle>
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

          {/* Duplicate Information */}
          {account.duplicate_group_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Duplicate Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : duplicateStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-600">{duplicateStats.total}</div>
                        <div className="text-sm text-blue-600">Total</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600">{duplicateStats.available}</div>
                        <div className="text-sm text-green-600">Available</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{duplicateStats.reserved}</div>
                        <div className="text-sm text-yellow-600">Reserved</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-2xl font-bold text-gray-600">{duplicateStats.sold}</div>
                        <div className="text-sm text-gray-600">Sold</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">All Duplicates:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {duplicateStats.duplicates.map((duplicate) => (
                          <div
                            key={duplicate.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                          >
                            <span>
                              {duplicate.duplicate_index === 0 ? "Original" : `Duplicate #${duplicate.duplicate_index}`}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusColor(duplicate.status)} className="text-xs">
                                {duplicate.status}
                              </Badge>
                              {duplicate.sold_at && (
                                <span className="text-xs text-gray-500">
                                  Sold: {new Date(duplicate.sold_at).toLocaleDateString("id-ID")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Failed to load duplicate information</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
