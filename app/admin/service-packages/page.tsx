"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react"
import { ServicePackageForm } from "@/components/admin/service-package-form"
import { ServicePackageViewModal } from "@/components/admin/service-package-view-modal"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"

interface ServicePackage {
  id: number
  service_id: number
  service_name: string
  category_name: string
  name: string
  description: string
  quantity: number
  price_user: number
  price_reseller: number
  status: string
  created_at: string
}

interface SocialService {
  id: number
  name: string
  category_name: string
  service_mode: string
}

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [services, setServices] = useState<SocialService[]>([])
  const [filteredPackages, setFilteredPackages] = useState<ServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)

  useEffect(() => {
    fetchPackages()
    fetchServices()
  }, [])

  useEffect(() => {
    filterPackages()
  }, [packages, searchTerm, serviceFilter])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/admin/service-packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/social-services")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services.filter((service: any) => service.service_mode === "package"))
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const filterPackages = () => {
    let filtered = packages

    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.service_id.toString() === serviceFilter)
    }

    setFilteredPackages(filtered)
  }

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg)
    setIsFormOpen(true)
  }

  const handleDelete = (pkg: ServicePackage) => {
    setSelectedPackage(pkg)
    setIsDeleteOpen(true)
  }

  const handleView = (pkg: ServicePackage) => {
    setSelectedPackage(pkg)
    setIsViewOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPackage) return

    try {
      const response = await fetch(`/api/admin/service-packages/${selectedPackage.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPackages(packages.filter((pkg) => pkg.id !== selectedPackage.id))
        setIsDeleteOpen(false)
        setSelectedPackage(null)
      }
    } catch (error) {
      console.error("Failed to delete package:", error)
    }
  }

  const handleFormSuccess = () => {
    fetchPackages()
    setIsFormOpen(false)
    setEditingPackage(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Service Packages</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Packages</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPackage(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
            </DialogHeader>
            <ServicePackageForm
              package={editingPackage}
              services={services}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingPackage(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} ({service.category_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold">{packages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold">{packages.filter((pkg) => pkg.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services with Packages</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price (User)</TableHead>
                <TableHead>Price (Reseller)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{pkg.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{pkg.service_name}</TableCell>
                  <TableCell>{pkg.category_name}</TableCell>
                  <TableCell>{pkg.quantity.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-blue-600">{formatCurrency(pkg.price_user)}</TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(pkg.price_reseller)}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.status === "active" ? "default" : "secondary"}>{pkg.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(pkg)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-500">Get started by creating your first service package.</p>
        </div>
      )}

      {/* View Modal */}
      {selectedPackage && (
        <ServicePackageViewModal
          package={selectedPackage}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedPackage(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedPackage(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Package"
        description={`Are you sure you want to delete "${selectedPackage?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
