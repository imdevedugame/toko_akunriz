"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
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

interface SocialCategoryViewModalProps {
  category: SocialCategory
  isOpen: boolean
  onClose: () => void
}

export function SocialCategoryViewModal({ category, isOpen, onClose }: SocialCategoryViewModalProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Category Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {category.image_url && (
            <div className="text-center">
              <Image
                src={category.image_url || "/placeholder.svg"}
                alt={category.name}
                width={120}
                height={120}
                className="rounded-lg object-cover mx-auto"
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{category.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</p>
            </div>

            {category.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-700">{category.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">{getStatusBadge(category.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{new Date(category.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated</label>
                <p className="text-sm">{new Date(category.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
