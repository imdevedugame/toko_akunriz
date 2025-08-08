"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Eye,
  CreditCard,
  Timer,
  Filter,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { OrderCancelButton } from "@/components/order-cancel-button"
import { toast } from "@/hooks/use-toast"

interface OrderItem {
  product_id: number
  product_name: string
  product_slug: string
  category_name: string
  quantity: number
  unit_price: number
  total_price: number
  is_flash_sale: boolean
  flash_sale_discount_percent: number
  original_price: number | null
  savings_amount: number
  account_email?: string
  account_password?: string
}

interface Order {
  id: number
  order_number: string
  type: string
  total_amount: number
  status: string
  display_status: string
  payment_method: string
  payment_status: string
  xendit_invoice_url: string
  expires_at: string
  minutes_until_expiry: number
  auto_cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  can_cancel: boolean
  items: OrderItem[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
      // Refresh every minute to update expiry times
      const interval = setInterval(fetchOrders, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        console.log("Orders data:", data.orders) // Debug log
        setOrders(data.orders)
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.product_name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "expired") {
        filtered = filtered.filter((order) => order.display_status === "expired")
      } else {
        filtered = filtered.filter((order) => order.status === statusFilter)
      }
    }

    setFilteredOrders(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrdersByStatus = (status: string) => {
    if (status === "expired") {
      return orders.filter((order) => order.display_status === "expired")
    }
    return orders.filter((order) => order.status === status)
  }

  const handleOrderCancelled = () => {
    fetchOrders()
    toast({
      title: "Order Cancelled",
      description: "Your order has been cancelled and stock has been released.",
    })
  }

  // Function to check if order can be cancelled - IMPROVED LOGIC
  const canCancelOrder = (order: Order) => {
    console.log("Checking cancel for order:", {
      order_number: order.order_number,
      status: order.status,
      display_status: order.display_status,
      minutes_until_expiry: order.minutes_until_expiry,
      xendit_invoice_url: !!order.xendit_invoice_url,
      auto_cancelled_at: order.auto_cancelled_at,
      can_cancel: order.can_cancel,
    })

    // Order can be cancelled if:
    // 1. Status is 'pending'
    // 2. Not expired yet (minutes_until_expiry > 0 OR display_status !== 'expired')
    // 3. Not auto-cancelled yet
    const canCancel =
      order.status === "pending" &&
      order.display_status !== "expired" &&
      order.minutes_until_expiry > 0 &&
      !order.auto_cancelled_at

    console.log("Can cancel result:", canCancel)
    return canCancel
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500">Please login to view your orders.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
            Login
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{getOrdersByStatus("pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{getOrdersByStatus("expired").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{getOrdersByStatus("completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">{getOrdersByStatus("cancelled").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Order Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <OrderStatusBadge
                      status={order.status}
                      displayStatus={order.display_status}
                      minutesUntilExpiry={order.minutes_until_expiry}
                    />
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.product_name}</h4>
                            {item.is_flash_sale && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Flash Sale -{item.flash_sale_discount_percent}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.category_name} • Qty: {item.quantity}
                          </p>
                          {item.savings_amount > 0 && (
                            <p className="text-sm text-green-600">Saved: {formatCurrency(item.savings_amount)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                          {item.original_price && item.original_price > item.unit_price && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.original_price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
                  </div>

                  {/* Expiry Warning - Muncul jika order pending dan akan expired dalam 30 menit */}
                  {order.status === "pending" && order.minutes_until_expiry > 0 && order.minutes_until_expiry <= 30 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          ⚠️ Order expires in {order.minutes_until_expiry} minutes! Complete payment now or cancel to
                          release stock.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {order.status === "cancelled" && order.cancellation_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Cancelled:</strong> {order.cancellation_reason}
                      </p>
                      {order.auto_cancelled_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Auto-cancelled at {formatDate(order.auto_cancelled_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions - CANCEL BUTTON MUNCUL DI SINI */}
                <div className="flex flex-col gap-2 lg:w-48">
                  {/* Pay Now Button - Muncul jika order pending dan ada payment URL */}
                  {order.status === "pending" && order.xendit_invoice_url && order.minutes_until_expiry > 0 && (
                    <Button asChild className="w-full">
                      <a href={order.xendit_invoice_url} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {/* CANCEL BUTTON - Muncul jika order bisa dibatalkan */}
                  {canCancelOrder(order) && (
                    <OrderCancelButton
                      orderNumber={order.order_number}
                      onCancelled={handleOrderCancelled}
                      className="w-full"
                    />
                  )}

                  {/* Debug info - Remove in production */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      <div>Status: {order.status}</div>
                      <div>Display: {order.display_status}</div>
                      <div>Minutes: {order.minutes_until_expiry}</div>
                      <div>Can Cancel: {canCancelOrder(order) ? "YES" : "NO"}</div>
                      <div>API Can Cancel: {order.can_cancel ? "YES" : "NO"}</div>
                    </div>
                  )}

                  {/* View Details Button - Selalu muncul */}
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {/* Info Text untuk order yang tidak bisa dicancel */}
                  {order.status === "pending" && order.minutes_until_expiry <= 0 && (
                    <p className="text-xs text-orange-600 text-center">Order expired - will be auto-cancelled</p>
                  )}

                  {order.status === "completed" && (
                    <p className="text-xs text-green-600 text-center">✅ Order completed successfully</p>
                  )}

                  {order.status === "cancelled" && (
                    <p className="text-xs text-red-600 text-center">❌ Order was cancelled</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No orders match your current filters."
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button className="mt-4" onClick={() => (window.location.href = "/products")}>
                Start Shopping
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order Number</label>
                    <p className="font-mono">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <OrderStatusBadge
                        status={selectedOrder.status}
                        displayStatus={selectedOrder.display_status}
                        minutesUntilExpiry={selectedOrder.minutes_until_expiry}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedOrder.total_amount)}</p>
                  </div>
                </div>

                {/* Cancel Button in Modal - Jika masih bisa dicancel */}
                {canCancelOrder(selectedOrder) && (
                  <div className="flex justify-center">
                    <OrderCancelButton
                      orderNumber={selectedOrder.order_number}
                      onCancelled={() => {
                        handleOrderCancelled()
                        setSelectedOrder(null)
                      }}
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                {/* Items */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-3 block">Order Items</label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">{item.category_name}</p>
                            <p className="text-sm">Quantity: {item.quantity}</p>
                            {item.is_flash_sale && (
                              <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                Flash Sale -{item.flash_sale_discount_percent}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                            {item.original_price && item.original_price > item.unit_price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.original_price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Account Details for Completed Orders */}
                        {selectedOrder.status === "completed" && item.account_email && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                            <h5 className="font-medium text-green-800 mb-2">Account Details</h5>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium">Email:</span> {item.account_email}
                              </div>
                              <div>
                                <span className="font-medium">Password:</span> {item.account_password}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
