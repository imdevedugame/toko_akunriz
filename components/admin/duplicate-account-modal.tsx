"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Users } from "lucide-react"

interface Account {
  id: number
  product_id: number
  product_name: string
  email: string
  password: string
  status: string
  duplicate_group_id: string | null
  duplicate_count: number
  original_account_id: number | null
}

interface DuplicateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (count: number) => void
  account: Account | null
}

export function DuplicateAccountModal({ isOpen, onClose, onConfirm, account }: DuplicateAccountModalProps) {
  const [duplicateCount, setDuplicateCount] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (duplicateCount < 1 || duplicateCount > 100) {
      alert("Duplicate count must be between 1 and 100")
      return
    }

    setIsCreating(true)
    try {
      await onConfirm(duplicateCount)
    } finally {
      setIsCreating(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Create Account Duplicates</span>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Account Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Product:</span>
              <p className="font-medium">{account.product_name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">{account.email}</code>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="ml-2 capitalize">{account.status}</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="duplicateCount">Number of Duplicates to Create</Label>
            <Input
              id="duplicateCount"
              type="number"
              min="1"
              max="100"
              value={duplicateCount}
              onChange={(e) => setDuplicateCount(Number.parseInt(e.target.value) || 1)}
              placeholder="Enter number of duplicates"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will create {duplicateCount} duplicate{duplicateCount !== 1 ? "s" : ""} of this account for shared
              usage.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-1">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Duplicates will share the same email and password</li>
              <li>• Each duplicate can be sold separately</li>
              <li>• Original account will be marked as the master account</li>
              <li>• You can track usage across all duplicates</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : `Create ${duplicateCount} Duplicate${duplicateCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
