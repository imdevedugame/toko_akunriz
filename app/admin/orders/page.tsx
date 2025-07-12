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
  CalendarIcon,
  Download,
  Eye,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Package,
  Users,
  Heart,
  MessageCircle,
  Play,
  UserPlus,
  Share2,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Order {
  id: number
  order_number: string
  user_id: number
  user_name: string
  user_email: string
  type: "product" | "indosmm" | "social"
  product_name?: string
  service_name?: string
  category_name?: string
  package_name?: string
  service_type?: string
  quantity: number
  total_amount: number
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "expired"
  payment_method?: string
  is_custom?: boolean
  target_url?: string
  whatsapp_number?: string
  comments?: string
  created_at: string
  updated_at: string
  items?: any[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
}

const typeColors = {
  product: "bg-indigo-100 text-indigo-800",
  indosmm: "bg-orange-100 text-orange-800",
  social: "bg-purple-100 text-purple-800",
}

const serviceTypeIcons = {
  followers: Users,
  likes: Heart,
  comments: MessageCircle,
  views: Play,
  subscribers: UserPlus,
  shares: Share2,
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, paymentStatusFilter, typeFilter, dateFrom, dateTo])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)

      // Fetch all order types
      const [productRes, indosmmRes, socialRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/indosmm-orders"),
        fetch("/api/admin/social-orders"),
      ])

      const allOrders: Order[] = []

      // Process product orders
      if (productRes.ok) {
        const productData = await productRes.json()
        const productOrders = productData.orders.map((order: any) => ({
          ...order,
          type: "product",
          user_name: order.user_email.split("@")[0], // Extract name from email
        }))
        allOrders.push(...productOrders)
      }

      // Process IndoSMM orders
      if (indosmmRes.ok) {
        const indosmmData = await indosmmRes.json()
        const indosmmOrders = indosmmData.orders.map((order: any) => ({
          ...order,
          type: "indosmm",
          user_name: order.user_email.split("@")[0],
        }))
        allOrders.push(...indosmmOrders)
      }

      // Process social media orders
      if (socialRes.ok) {
        const socialData = await socialRes.json()
        const socialOrders = socialData.orders.map((order: any) => ({
          ...order,
          type: "social",
          user_name: order.user_email.split("@")[0],
        }))
        allOrders.push(...socialOrders)
      }

      // Sort by created_at descending
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setOrders(allOrders)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoading(false)
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
          order.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Payment status filter
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter((order) => order.payment_status === paymentStatusFilter)
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
      ["Order Number", "Customer", "Type", "Product/Service", "Amount", "Status", "Payment Status", "Date"],
      ...filteredOrders.map((order) => [
        order.order_number,
        order.user_name,
        order.type,
        order.product_name || order.service_name || "-",
        order.total_amount,
        order.status,
        order.payment_status,
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

  const getServiceTypeIcon = (type: string) => {
    const Icon = serviceTypeIcons[type as keyof typeof serviceTypeIcons] || Package
    return <Icon className="h-4 w-4" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="indosmm">IndoSMM</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredOrders
                  .filter((order) => order.payment_status === "paid")
                  .reduce((sum, order) => sum + order.total_amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredOrders.filter((order) => order.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {filteredOrders.filter((order) => order.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
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
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRow key={`${order.type}-${order.id}`}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user_name}</div>
                      <div className="text-sm text-gray-500">{order.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[order.type]}>
                      {order.type === "product" ? "Product" : order.type === "indosmm" ? "IndoSMM" : "Social"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="truncate flex items-center gap-2">
                        {order.type === "social" && order.service_type && getServiceTypeIcon(order.service_type)}
                        {order.product_name || order.service_name || "-"}
                      </div>
                      {order.package_name && <div className="text-xs text-gray-500">Package: {order.package_name}</div>}
                      {order.category_name && <div className="text-xs text-gray-500">{order.category_name}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                 <TableCell>
  <Badge className={paymentStatusColors[order.payment_status || "pending"]}>
    {(order.payment_status || "pending")
      .charAt(0)
      .toUpperCase() + (order.payment_status || "pending").slice(1)}
  </Badge>
</TableCell>

                  <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: id })}</TableCell>
                  <TableCell>
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
                                <div>
                                  <Badge className={typeColors[selectedOrder.type]}>
                                    {selectedOrder.type === "product"
                                      ? "Product"
                                      : selectedOrder.type === "indosmm"
                                        ? "IndoSMM Service"
                                        : "Social Media"}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div>
                                  <Badge className={statusColors[selectedOrder.status]}>
                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Payment Status</label>
                                <div>
                                 {selectedOrder.payment_status && (
  <Badge className={paymentStatusColors[selectedOrder.payment_status]}>
    {selectedOrder.payment_status.charAt(0).toUpperCase() +
      selectedOrder.payment_status.slice(1)}
  </Badge>
)}

                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Quantity</label>
                              <p>{selectedOrder.quantity != null ? selectedOrder.quantity.toLocaleString() : "-"}</p>

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

                            {/* Social Media specific fields */}
                            {selectedOrder.type === "social" && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <p>{selectedOrder.category_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Service Type</label>
                                    <p className="flex items-center gap-2">
                                      {selectedOrder.service_type && getServiceTypeIcon(selectedOrder.service_type)}
                                      {selectedOrder.service_type}
                                    </p>
                                  </div>
                                  {selectedOrder.package_name && (
                                    <div>
                                      <label className="text-sm font-medium">Package</label>
                                      <p>{selectedOrder.package_name}</p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-sm font-medium">Order Type</label>
                                    <div>
                                      <Badge variant={selectedOrder.is_custom ? "outline" : "default"}>
                                        {selectedOrder.is_custom ? "Custom" : "Package"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {selectedOrder.target_url && (
                                  <div>
                                    <label className="text-sm font-medium">Target URL</label>
                                    <p className="truncate max-w-xs">
                                      <a
                                        href={selectedOrder.target_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        {selectedOrder.target_url}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </p>
                                  </div>
                                )}
                                {selectedOrder.whatsapp_number && (
                                  <div>
                                    <label className="text-sm font-medium">WhatsApp</label>
                                    <p>{selectedOrder.whatsapp_number}</p>
                                  </div>
                                )}
                                {selectedOrder.comments && (
                                  <div>
                                    <label className="text-sm font-medium">Comments</label>
                                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.comments}</p>
                                  </div>
                                )}
                              </>
                            )}

                            {/* IndoSMM specific fields */}
                            {selectedOrder.type === "indosmm" && selectedOrder.target_url && (
                              <div>
                                <label className="text-sm font-medium">Target URL</label>
                                <p className="truncate max-w-xs">
                                  <a
                                    href={selectedOrder.target_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {selectedOrder.target_url}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
