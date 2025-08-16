import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react"

interface OrderStatusBadgeProps {
  status: string
  displayStatus?: string
  minutesUntilExpiry?: number
  className?: string
}

export function OrderStatusBadge({ status, displayStatus, minutesUntilExpiry, className }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    const actualStatus = displayStatus || status

    switch (actualStatus) {
      case "pending":
      case "active":
        return {
          label:
            minutesUntilExpiry && minutesUntilExpiry > 0 ? `Pending (${minutesUntilExpiry}m left)` : "Pending Payment",
          variant: "default" as const,
          icon: Clock,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        }
      case "expired":
        return {
          label: "Expired",
          variant: "destructive" as const,
          icon: AlertTriangle,
          className: "bg-orange-100 text-orange-800 border-orange-200",
        }
      case "paid":
      case "processing":
        return {
          label: "Processing",
          variant: "default" as const,
          icon: Package,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        }
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 border-green-200",
        }
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200",
        }
      case "failed":
        return {
          label: "Failed",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200",
        }
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
