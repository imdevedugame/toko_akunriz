"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CalendarIcon, Download, Eye, Filter, Search, RefreshCw, Edit, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Order {
  id: number
  order_number: string
  user_id: number
  user_name: string
  user_email: string
  type: "premium" | "indosmm"
  product_name?: string
  service_name?: string
  quantity: number
  total_amount: number
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled"
  payment_method?: string
  created_at: string
  updated_at: string
  items?: any[]
  indosmm_order_id?: string
  indosmm_status?: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const typeColors = {
  premium: "bg-indigo-100 text-indigo-800",
  indosmm: "bg-orange-100 text-orange-800",
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "paid", label: "Paid", color: "bg-blue-500" },
  { value: "processing", label: "Processing", color: "bg-purple-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "failed", label: "Failed", color: "bg-red-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-500" },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Status update
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, typeFilter, dateFrom, dateTo])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      setIsUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()

        // Update orders in state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: status as any, updated_at: new Date().toISOString() } : order,
          ),
        )

        toast({
          title: "Success",
          description: `Order status updated to ${status}`,
        })

        setStatusUpdateOrder(null)
        setNewStatus("")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const retryIndoSMMOrder = async (orderId: number) => {
    try {
      setIsUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${orderId}/retry-indosmm`, {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()

        // Refresh orders
        await fetchOrders()

        toast({
          title: "Success",
          description: "IndoSMM order retry initiated",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to retry IndoSMM order")
      }
    } catch (error) {
      console.error("Failed to retry IndoSMM order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retry IndoSMM order",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.service_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((order) => order.type === typeFilter)
    }

    // Date filter
    if (dateFrom) {
      filtered = filtered.filter((order) => new Date(order.created_at) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((order) => new Date(order.created_at) <= dateTo)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Order Number", "Customer", "Type", "Product/Service", "Amount", "Status", "Date"],
      ...filteredOrders.map((order) => [
        order.order_number,
        order.user_name,
        order.type,
        order.product_name || order.service_name || "-",
        order.total_amount,
        order.status,
        format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: id }),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order History</h1>
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
        <h1 className="text-3xl font-bold">Order History</h1>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="premium">Premium Account</SelectItem>
                <SelectItem value="indosmm">IndoSMM Service</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal bg-white", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal bg-white", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredOrders.reduce(
                  (sum, order) =>
                    typeof order.total_amount === "number" && !isNaN(order.total_amount)
                      ? sum + order.total_amount
                      : sum,
                  0,
                ),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredOrders.filter((order) => order.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredOrders.filter((order) => order.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product/Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRow key={order.id} className="bg-white">
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user_name}</div>
                      <div className="text-sm text-gray-500">{order.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[order.type]}>{order.type === "premium" ? "Premium" : "IndoSMM"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">{order.product_name || order.service_name || "-"}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: id })}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {/* View Order Details */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white">
                          <DialogHeader>
                            <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Customer</label>
                                  <p>{selectedOrder.user_name}</p>
                                  <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Order Type</label>
                                  <p>
                                    <Badge className={typeColors[selectedOrder.type]}>
                                      {selectedOrder.type === "premium" ? "Premium Account" : "IndoSMM Service"}
                                    </Badge>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <p>
                                    <Badge className={statusColors[selectedOrder.status]}>
                                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                    </Badge>
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Total Amount</label>
                                  <p className="text-lg font-bold">{formatCurrency(selectedOrder.total_amount)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Created</label>
                                  <p>
                                    {format(new Date(selectedOrder.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Updated</label>
                                  <p>
                                    {format(new Date(selectedOrder.updated_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                                  </p>
                                </div>
                              </div>

                              {/* IndoSMM Order Info */}
                              {selectedOrder.type === "indosmm" && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                                  <div>
                                    <label className="text-sm font-medium">IndoSMM Order ID</label>
                                    <p className="font-mono text-sm">
                                      {selectedOrder.indosmm_order_id || "Not assigned"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">IndoSMM Status</label>
                                    <p>{selectedOrder.indosmm_status || "Unknown"}</p>
                                  </div>
                                </div>
                              )}

                              {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium">Order Items</label>
                                  <div className="mt-2 space-y-2">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                      <div key={index} className="p-3 border rounded-lg bg-white">
                                        <div className="flex justify-between">
                                          <span>{item.product_name || item.service_name}</span>
                                          <span>{formatCurrency(item.price)}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Update Status */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStatusUpdateOrder(order)
                              setNewStatus(order.status)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Order: {statusUpdateOrder?.order_number}</label>
                              <p className="text-sm text-gray-500">Customer: {statusUpdateOrder?.user_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">New Status</label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                        {status.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setStatusUpdateOrder(null)
                                  setNewStatus("")
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => statusUpdateOrder && updateOrderStatus(statusUpdateOrder.id, newStatus)}
                                disabled={isUpdatingStatus || !newStatus || newStatus === statusUpdateOrder?.status}
                              >
                                {isUpdatingStatus ? "Updating..." : "Update Status"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Retry IndoSMM Order (only for failed IndoSMM orders) */}
                      {order.type === "indosmm" && (order.status === "failed" || order.status === "paid") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Retry IndoSMM Order">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Retry IndoSMM Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will retry sending the order to IndoSMM API. Are you sure you want to continue?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => retryIndoSMMOrder(order.id)}
                                disabled={isUpdatingStatus}
                              >
                                {isUpdatingStatus ? "Retrying..." : "Retry Order"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Quick Status Actions */}
                      {order.status === "processing" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          disabled={isUpdatingStatus}
                          title="Mark as Completed"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}

                      {(order.status === "pending" || order.status === "paid") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={isUpdatingStatus}
                          title="Cancel Order"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
