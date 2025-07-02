"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IndoSMMService {
  id?: number
  service_id: number
  name: string
  category: string
  rate: number
  min_order: number
  max_order: number
  user_rate: number
  reseller_rate: number
  status: string
}

interface ServiceFormProps {
  service?: IndoSMMService
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<IndoSMMService>({
    service_id: 0,
    name: "",
    category: "",
    rate: 0,
    min_order: 1,
    max_order: 10000,
    user_rate: 0,
    reseller_rate: 0,
    status: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (service) {
      setFormData(service)
    }
  }, [service])

  const handleRateChange = (baseRate: number) => {
    const userRate = baseRate * 1.2 // 20% markup for users
    const resellerRate = baseRate * 1.1 // 10% markup for resellers

    setFormData({
      ...formData,
      rate: baseRate,
      user_rate: userRate,
      reseller_rate: resellerRate,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.service_id || !formData.name || !formData.category) {
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      <div>
        <Label htmlFor="service_id">Service ID *</Label>
        <Input
          id="service_id"
          type="number"
          value={formData.service_id}
          onChange={(e) => setFormData({ ...formData, service_id: Number.parseInt(e.target.value) || 0 })}
          placeholder="1234"
          required
        />
      </div>

      <div>
        <Label htmlFor="name">Service Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Instagram Followers"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Instagram"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_order">Min Order *</Label>
          <Input
            id="min_order"
            type="number"
            value={formData.min_order}
            onChange={(e) => setFormData({ ...formData, min_order: Number.parseInt(e.target.value) || 1 })}
            placeholder="100"
            required
          />
        </div>

        <div>
          <Label htmlFor="max_order">Max Order *</Label>
          <Input
            id="max_order"
            type="number"
            value={formData.max_order}
            onChange={(e) => setFormData({ ...formData, max_order: Number.parseInt(e.target.value) || 10000 })}
            placeholder="10000"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rate">Base Rate (IDR per 1000) *</Label>
        <Input
          id="rate"
          type="number"
          step="0.01"
          value={formData.rate}
          onChange={(e) => handleRateChange(Number.parseFloat(e.target.value) || 0)}
          placeholder="5000"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="user_rate">User Rate (Auto calculated)</Label>
          <Input id="user_rate" type="number" step="0.01" value={formData.user_rate} readOnly className="bg-gray-50" />
        </div>

        <div>
          <Label htmlFor="reseller_rate">Reseller Rate (Auto calculated)</Label>
          <Input
            id="reseller_rate"
            type="number"
            step="0.01"
            value={formData.reseller_rate}
            readOnly
            className="bg-gray-50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : service ? "Update Service" : "Create Service"}
        </Button>
      </div>
    </form>
  )
}
