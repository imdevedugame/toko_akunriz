"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Target, Hash, Clock, ExternalLink, Home, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface IndoSMMOrderDetails {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
  service_name: string
  service_category: string
  service_image: string
  target: string
  quantity: number
  indosmm_order_id?: number
  indosmm_status?: string
  start_count?: number
  remains?: number
}

export default function IndoSMMSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<IndoSMMOrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingStatus, setProcessingStatus] = useState<string>("pending")

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
      // Poll for IndoSMM order status every 10 seconds
      const interval = setInterval(fetchOrderDetails, 10000)
      return () => clearInterval(interval)
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/indosmm-orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setProcessingStatus(data.order.indosmm_status || "pending")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
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
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "in progress":
      case "processing":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "partial":
        return "bg-orange-500"
      case "canceled":
      case "cancelled":
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed"
      case "in progress":
        return "In Progress"
      case "processing":
        return "Processing"
      case "pending":
        return "Pending"
      case "partial":
        return "Partially Completed"
      case "canceled":
      case "cancelled":
        return "Cancelled"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order with that number was not found.</p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your IndoSMM service order has been created</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order Number</label>
                <p className="font-mono text-sm">{order.order_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Payment</label>
                <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={getStatusColor(processingStatus)}>{getStatusText(processingStatus)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              {order.service_image && (
                <Image
                  src={order.service_image || "/placeholder.svg"}
                  alt={order.service_category}
                  width={80}
                  height={80}
                  className="object-contain rounded-lg border"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{order.service_name}</h3>
                <Badge variant="secondary" className="mb-3">
                  {order.service_category}
                </Badge>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Target
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="break-all">{order.target}</p>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => window.open(order.target, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Quantity
                    </label>
                    <p className="font-medium mt-1">{order.quantity.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.indosmm_order_id ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">IndoSMM Order ID:</span>
                  <span className="font-mono text-sm">{order.indosmm_order_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={getStatusColor(order.indosmm_status || "pending")}>
                    {getStatusText(order.indosmm_status || "pending")}
                  </Badge>
                </div>
                {order.start_count !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Start Count:</span>
                    <span className="font-medium">{order.start_count.toLocaleString()}</span>
                  </div>
                )}
                {order.remains !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Remaining:</span>
                    <span className="font-medium">{order.remains.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-blue-600 font-medium">Processing your order...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your order is being submitted to IndoSMM. This usually takes 1-5 minutes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Status Explanation:</p>
              <ul className="space-y-1">
                <li>
                  • <strong>Pending:</strong> Order is being processed
                </li>
                <li>
                  • <strong>In Progress:</strong> Service is being delivered
                </li>
                <li>
                  • <strong>Completed:</strong> Order completed successfully
                </li>
                <li>
                  • <strong>Partial:</strong> Partially completed (common for large orders)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              View Order History
            </Button>
          </Link>
          <Link href="/services" className="flex-1">
            <Button className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Order More Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
