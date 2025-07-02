"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, Eye, ExternalLink } from "lucide-react"
import { IndoSMMOrderViewModal } from "@/components/admin/indosmm-order-view-modal"

interface IndoSMMOrder {
  id: number
  order_number: string
  user_name: string
  user_email: string
  service_name: string
  service_category: string
  target: string
  quantity: number
  price: number
  indosmm_order_id: number | null
  indosmm_status: string
  start_count: number
  remains: number
  created_at: string
  updated_at: string
}

export default function AdminIndoSMMOrdersPage() {
  const [orders, setOrders] = useState<IndoSMMOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewingOrder, setViewingOrder] = useState<IndoSMMOrder | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/indosmm-orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to fetch IndoSMM orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrderStatus = async (orderId: number) => {
    try {
      const response = await fetch(`/api/admin/indosmm-orders/${orderId}/refresh`, {
        method: "POST",
      })

      if (response.ok) {
        fetchOrders()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to refresh order status")
      }
    } catch (error) {
      console.error("Refresh order error:", error)
      alert("Failed to refresh order status")
    }
  }

  const refreshAllOrders = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/indosmm-orders/refresh-all", {
        method: "POST",
      })

      if (response.ok) {
        fetchOrders()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to refresh orders")
      }
    } catch (error) {
      console.error("Refresh all orders error:", error)
      alert("Failed to refresh orders")
    } finally {
      setIsRefreshing(false)
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
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "in progress":
        return "secondary"
      case "pending":
        return "outline"
      case "partial":
        return "secondary"
      case "canceled":
      case "cancelled":
        return "destructive"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.target.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.indosmm_status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IndoSMM Orders</h1>
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
        <h1 className="text-3xl font-bold">IndoSMM Orders</h1>
        <Button onClick={refreshAllOrders} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh All Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">{filteredOrders.length} orders found</div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user_name}</div>
                      <div className="text-sm text-gray-500">{order.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.service_name}</div>
                      <Badge variant="outline" className="text-xs">
                        {order.service_category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-32 truncate" title={order.target}>
                      {order.target}
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(order.price)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.indosmm_status)}>{order.indosmm_status || "pending"}</Badge>
                  </TableCell>
                  <TableCell>
                    {order.indosmm_order_id && (
                      <div className="text-sm">
                        <div>Start: {order.start_count}</div>
                        <div>Remains: {order.remains}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.indosmm_order_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => refreshOrderStatus(order.id)}
                          title="Refresh Status"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "IndoSMM orders will appear here once customers start placing orders."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Modal */}
      {viewingOrder && (
        <IndoSMMOrderViewModal
          order={viewingOrder}
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          onRefresh={() => {
            refreshOrderStatus(viewingOrder.id)
            setViewingOrder(null)
          }}
        />
      )}
    </div>
  )
}
