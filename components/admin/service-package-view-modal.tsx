import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, DollarSign, Hash } from "lucide-react"

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

interface ServicePackageViewModalProps {
  package: ServicePackage
  isOpen: boolean
  onClose: () => void
}

export function ServicePackageViewModal({ package: pkg, isOpen, onClose }: ServicePackageViewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDiscount = () => {
    if (pkg.price_user <= pkg.price_reseller) return 0
    return Math.round(((pkg.price_user - pkg.price_reseller) / pkg.price_user) * 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="max-w-2xl bg-white ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Package Name</label>
              <p className="text-lg font-semibold">{pkg.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <Badge variant={pkg.status === "active" ? "default" : "secondary"}>{pkg.status}</Badge>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Service</label>
              <p className="font-medium">{pkg.service_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Category</label>
              <p className="font-medium">{pkg.category_name}</p>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="mt-1 text-gray-800 whitespace-pre-wrap">{pkg.description}</p>
            </div>
          )}

          {/* Package Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Hash className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity</p>
                <p className="text-xl font-bold text-blue-600">{pkg.quantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">User Price</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(pkg.price_user)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Reseller Price</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(pkg.price_reseller)}</p>
                {calculateDiscount() > 0 && <p className="text-xs text-purple-500">{calculateDiscount()}% discount</p>}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(pkg.created_at)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
