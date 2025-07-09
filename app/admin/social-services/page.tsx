"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye, Users, Heart, MessageCircle, EyeIcon, UserPlus, Share2 } from "lucide-react"
import { SocialServiceForm } from "@/components/admin/social-service-form"
import { SocialServiceViewModal } from "@/components/admin/social-service-view-modal"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"

interface SocialService {
  id: number
  category_id: number
  name: string
  description: string
  service_type: string
  price_user: number
  price_reseller: number
  min_order: number
  max_order: number
  features: string[]
  status: string
  service_mode: string
  category_name: string
  created_at: string
  updated_at: string
}

interface SocialCategory {
  id: number
  name: string
  status: string
}

const serviceTypeIcons = {
  followers: Users,
  likes: Heart,
  comments: MessageCircle,
  views: EyeIcon,
  subscribers: UserPlus,
  shares: Share2,
}

const serviceTypeLabels = {
  followers: "Followers",
  likes: "Likes",
  comments: "Comments",
  views: "Views",
  subscribers: "Subscribers",
  shares: "Shares",
}

export default function SocialServicesPage() {
  const [services, setServices] = useState<SocialService[]>([])
  const [categories, setCategories] = useState<SocialCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedService, setSelectedService] = useState<SocialService | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingService, setEditingService] = useState<SocialService | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchServices()
  }, [searchTerm, categoryFilter, serviceTypeFilter, statusFilter])

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/social-services"),
        fetch("/api/admin/social-categories"),
      ])

      if (servicesRes.ok && categoriesRes.ok) {
        const servicesData = await servicesRes.json()
        const categoriesData = await categoriesRes.json()

        setServices(servicesData.services)
        setCategories(categoriesData.categories.filter((cat: SocialCategory) => cat.status === "active"))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (serviceTypeFilter !== "all") params.append("service_type", serviceTypeFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/social-services?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const handleEdit = (service: SocialService) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleView = (service: SocialService) => {
    setSelectedService(service)
    setIsViewOpen(true)
  }

  const handleDelete = (service: SocialService) => {
    setSelectedService(service)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedService) return

    try {
      const response = await fetch(`/api/admin/social-services/${selectedService.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchServices()
        setIsDeleteOpen(false)
        setSelectedService(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete service")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete service")
    }
  }

  const handleFormSuccess = () => {
    fetchServices()
    setIsFormOpen(false)
    setEditingService(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const getServiceTypeIcon = (type: string) => {
    const Icon = serviceTypeIcons[type as keyof typeof serviceTypeIcons] || Users
    return <Icon className="h-4 w-4" />
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Media Services</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Services</CardTitle>
          <div className="text-sm text-gray-600">
            Configure pricing for both regular users and resellers. Resellers typically get 10-20% discount.
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(serviceTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Price (User)</TableHead>
                  <TableHead>Price (Reseller)</TableHead>
                  <TableHead>Min-Max Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{service.category_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getServiceTypeIcon(service.service_type)}
                        <span className="text-sm">
                          {serviceTypeLabels[service.service_type as keyof typeof serviceTypeLabels]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.service_mode === "package" ? "default" : "outline"}>
                        {service.service_mode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600">{formatPrice(service.price_user)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">{formatPrice(service.price_reseller)}</div>
                      <div className="text-xs text-gray-500">
                        {((1 - service.price_reseller / service.price_user) * 100).toFixed(0)}% discount
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {service.min_order.toLocaleString()} - {service.max_order.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(service)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <SocialServiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingService(null)
        }}
        onSuccess={handleFormSuccess}
        service={editingService}
        categories={categories}
      />

      {/* View Modal */}
      {selectedService && (
        <SocialServiceViewModal
          service={selectedService}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedService(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedService(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Service"
        description={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
