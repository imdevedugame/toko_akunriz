"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Account {
  id?: number
  product_id: number
  email: string
  password: string
  status?: string
  duplicate_count?: number
}

interface Product {
  id: number
  name: string
}

interface AccountFormProps {
  account?: Account
  products: Product[]
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AccountForm({ account, products, onSubmit, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState<Account & { create_duplicates?: boolean; duplicate_count?: number }>({
    product_id: 0,
    email: "",
    password: "",
    status: "available",
    create_duplicates: false,
    duplicate_count: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        create_duplicates: false,
        duplicate_count: account.duplicate_count || 1,
      })
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id || !formData.email || !formData.password) {
      alert("Please fill in all required fields")
      return
    }

    if (formData.create_duplicates && (!formData.duplicate_count || formData.duplicate_count < 1)) {
      alert("Please enter a valid duplicate count")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="product_id">kode sku/slug </Label>
        <Select
          value={formData.product_id.toString()}
          onValueChange={(value) => setFormData({ ...formData, product_id: Number.parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="account@example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Account password"
          required
        />
      </div>

      {!account && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create_duplicates"
              checked={formData.create_duplicates}
              onCheckedChange={(checked) => setFormData({ ...formData, create_duplicates: checked as boolean })}
            />
            <Label htmlFor="create_duplicates" className="text-sm font-medium">
              Create duplicates for shared usage
            </Label>
          </div>

          {formData.create_duplicates && (
            <div>
              <Label htmlFor="duplicate_count">Number of Duplicates</Label>
              <Input
                id="duplicate_count"
                type="number"
                min="1"
                max="100"
                value={formData.duplicate_count}
                onChange={(e) => setFormData({ ...formData, duplicate_count: Number.parseInt(e.target.value) || 1 })}
                placeholder="Enter number of duplicates"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will create {formData.duplicate_count} duplicate{formData.duplicate_count !== 1 ? "s" : ""} of this
                account.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : account ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  )
}
