"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Eye, FolderSyncIcon as Sync, ChevronLeft, ChevronRight } from "lucide-react"
import { ServiceForm } from "@/components/admin/service-form"
import { ServiceViewModal } from "@/components/admin/service-view-modal"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"

interface IndoSMMService {
  id: number
  service_id: number
  name: string
  category: string
  rate: number
  min_order: number
  max_order: number
  user_rate: number
  reseller_rate: number
  status: string
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<IndoSMMService[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingService, setEditingService] = useState<IndoSMMService | null>(null)
  const [viewingService, setViewingService] = useState<IndoSMMService | null>(null)
  const [deletingService, setDeletingService] = useState<IndoSMMService | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const categories = ["Instagram", "Facebook", "TikTok", "YouTube"]

  useEffect(() => {
    fetchServices()
  }, [pagination.page, searchTerm, categoryFilter, statusFilter])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/services?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncServices = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/services", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        alert(
          `✅ Services synced successfully!\n🆕 ${data.synced} new\n🔄 ${data.updated} updated\n📋 Categories: ${data.allowedCategories.join(", ")}`,
        )
        fetchServices()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to sync services")
      }
    } catch (error) {
      console.error("Sync services error:", error)
      alert("Failed to sync services")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCreateService = async (serviceData: any) => {
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchServices()
        alert("Service created successfully")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create service")
      }
    } catch (error) {
      console.error("Create service error:", error)
      alert("Failed to create service")
    }
  }

  const handleUpdateService = async (serviceData: any) => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        setEditingService(null)
        fetchServices()
        alert("Service updated successfully")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update service")
      }
    } catch (error) {
      console.error("Update service error:", error)
      alert("Failed to update service")
    }
  }

  const handleDeleteService = async (service: IndoSMMService) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDeletingService(null)
        fetchServices()
        alert("Service deleted successfully")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete service")
      }
    } catch (error) {
      console.error("Delete service error:", error)
      alert("Failed to delete service")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IndoSMM Services</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IndoSMM Services</h1>
          <p className="text-gray-600 mt-1">Menampilkan layanan: {categories.join(", ")}</p>
          <div className="text-sm text-blue-600 mt-1">
            💡 <strong>Cara menambah layanan:</strong> Edit file <code>app/api/services/route.ts</code> pada bagian{" "}
            <code>ALLOWED_CATEGORIES</code>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={syncServices} disabled={isSyncing} variant="outline">
            <Sync className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            Sync from IndoSMM
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>Add a new IndoSMM service manually.</DialogDescription>
              </DialogHeader>
              <ServiceForm onSubmit={handleCreateService} onCancel={() => setShowCreateModal(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">{pagination.total} services found</div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>User Rate</TableHead>
                <TableHead>Reseller Rate</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">ID: {service.service_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(service.rate)}</TableCell>
                  <TableCell>{formatCurrency(service.user_rate)}</TableCell>
                  <TableCell>{formatCurrency(service.reseller_rate)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Min: {service.min_order.toLocaleString()}</div>
                      <div>Max: {service.max_order.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(service.status)}>{service.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingService(service)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingService(service)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {services.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by syncing services from IndoSMM API."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} services
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {pagination.pages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <Button
                        variant={pagination.page === pagination.pages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pagination.pages)}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Service Modal */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service information.</DialogDescription>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSubmit={handleUpdateService}
              onCancel={() => setEditingService(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Service Modal */}
      {viewingService && (
        <ServiceViewModal service={viewingService} isOpen={!!viewingService} onClose={() => setViewingService(null)} />
      )}

      {/* Delete Confirmation */}
      {deletingService && (
        <DeleteConfirmDialog
          isOpen={!!deletingService}
          onClose={() => setDeletingService(null)}
          onConfirm={() => handleDeleteService(deletingService)}
          title="Delete Service"
          description={`Are you sure you want to delete "${deletingService.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}
