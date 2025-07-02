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
import { Plus, Search, Edit, Trash2, Eye, Upload } from "lucide-react"
import { AccountForm } from "@/components/admin/account-form"
import { AccountViewModal } from "@/components/admin/account-view-modal"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import { BulkAccountUpload } from "@/components/admin/bulk-account-upload"

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

interface Product {
  id: number
  name: string
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  useEffect(() => {
    fetchAccounts()
    fetchProducts()
  }, [statusFilter, productFilter])

  const fetchAccounts = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (productFilter !== "all") params.append("product_id", productFilter)

      const response = await fetch(`/api/admin/accounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const handleCreateAccount = async (accountData: any) => {
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchAccounts()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Create account error:", error)
      alert("Failed to create account")
    }
  }

  const handleUpdateAccount = async (accountData: any) => {
    if (!editingAccount) return

    try {
      const response = await fetch(`/api/admin/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (response.ok) {
        setEditingAccount(null)
        fetchAccounts()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update account")
      }
    } catch (error) {
      console.error("Update account error:", error)
      alert("Failed to update account")
    }
  }

  const handleDeleteAccount = async (account: Account) => {
    try {
      const response = await fetch(`/api/admin/accounts/${account.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDeletingAccount(null)
        fetchAccounts()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Delete account error:", error)
      alert("Failed to delete account")
    }
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

  const filteredAccounts = accounts.filter(
    (account) =>
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.product_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Inventory</h1>
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
        <h1 className="text-3xl font-bold">Account Inventory</h1>
        <div className="flex space-x-2">
          <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>Bulk Upload Accounts</DialogTitle>
                <DialogDescription>Upload multiple accounts at once using CSV format.</DialogDescription>
              </DialogHeader>
              <BulkAccountUpload
                products={products}
                onSuccess={() => {
                  setShowBulkUpload(false)
                  fetchAccounts()
                }}
                onCancel={() => setShowBulkUpload(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Add a new premium account to your inventory.</DialogDescription>
              </DialogHeader>
              <AccountForm
                products={products}
                onSubmit={handleCreateAccount}
                onCancel={() => setShowCreateModal(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">{filteredAccounts.length} accounts found</div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sold Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} className="bg-white">
                  <TableCell>
                    <div className="font-medium">{account.product_name}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{account.email}</code>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{"*".repeat(account.password.length)}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(account.status)}>{account.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(account.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>{account.sold_at ? new Date(account.sold_at).toLocaleDateString("id-ID") : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingAccount(account)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {account.status === "available" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setEditingAccount(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingAccount(account)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || productFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first account."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Account Modal */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the account information.</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              account={editingAccount}
              products={products}
              onSubmit={handleUpdateAccount}
              onCancel={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Account Modal */}
      {viewingAccount && (
        <AccountViewModal account={viewingAccount} isOpen={!!viewingAccount} onClose={() => setViewingAccount(null)} />
      )}

      {/* Delete Confirmation */}
      {deletingAccount && (
        <DeleteConfirmDialog
          isOpen={!!deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onConfirm={() => handleDeleteAccount(deletingAccount)}
          title="Delete Account"
          description={`Are you sure you want to delete account "${deletingAccount.email}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}
