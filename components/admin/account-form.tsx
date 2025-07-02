"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Account {
  id?: number
  product_id: number
  email: string
  password: string
  status?: string
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
  const [formData, setFormData] = useState<Account>({
    product_id: 0,
    email: "",
    password: "",
    status: "available",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData(account)
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id || !formData.email || !formData.password) {
      alert("Please fill in all required fields")
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-md shadow">
      <div>
        <Label htmlFor="product_id">Product *</Label>
        <Select
          value={formData.product_id.toString()}
          onValueChange={(value) => setFormData({ ...formData, product_id: Number.parseInt(value) })}
        >
          <SelectTrigger className="bg-white text-black">
        <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white">
        {products.map((product) => (
          <SelectItem
            key={product.id}
            value={product.id.toString()}
            className="bg-black text-white data-[state=checked]:bg-gray-800"
          >
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
