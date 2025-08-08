"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { SocialCategoryForm } from "@/components/admin/social-category-form"
import { SocialCategoryViewModal } from "@/components/admin/social-category-view-modal"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import Image from "next/image"

interface SocialCategory {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
}

export default function SocialCategoriesPage() {
  const [categories, setCategories] = useState<SocialCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<SocialCategory | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SocialCategory | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [searchTerm, statusFilter])

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/social-categories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: SocialCategory) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleView = (category: SocialCategory) => {
    setSelectedCategory(category)
    setIsViewOpen(true)
  }

  const handleDelete = (category: SocialCategory) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/admin/social-categories/${selectedCategory.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
        setIsDeleteOpen(false)
        setSelectedCategory(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete category")
    }
  }

  const handleFormSuccess = () => {
    fetchCategories()
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
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
        <h1 className="text-3xl font-bold">Social Media Categories</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url ? (
                        <Image
                          src={category.image_url || "/placeholder.svg"}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{category.slug}</code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{category.description || "-"}</TableCell>
                    <TableCell>{getStatusBadge(category.status)}</TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(category)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <SocialCategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCategory(null)
        }}
        onSuccess={handleFormSuccess}
        category={editingCategory}
      />

      {/* View Modal */}
      {selectedCategory && (
        <SocialCategoryViewModal
          category={selectedCategory}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedCategory(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
