"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, AlertCircle } from "lucide-react"

interface Product {
  id: number
  name: string
}

interface BulkAccountUploadProps {
  products: Product[]
  onSuccess: () => void
  onCancel: () => void
}

export function BulkAccountUpload({ products, onSuccess, onCancel }: BulkAccountUploadProps) {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const downloadTemplate = () => {
    const csvContent = "email,password\nexample1@domain.com,password123\nexample2@domain.com,password456"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "account_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!selectedProduct || !file) {
      alert("Please select a product and upload a CSV file")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("product_id", selectedProduct)

      const response = await fetch("/api/admin/accounts/bulk-upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result)
        if (result.success_count > 0) {
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the CSV template below</li>
            <li>Fill in the email and password columns</li>
            <li>Select the target product</li>
            <li>Upload your completed CSV file</li>
          </ol>

          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="product">Target Product *</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file">CSV File *</Label>
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
          {file && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Upload Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Processed:</span>
                <span className="font-medium">{uploadResult.total_processed}</span>
              </div>
              <div className="flex justify-between">
                <span>Successfully Added:</span>
                <span className="font-medium text-green-600">{uploadResult.success_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="font-medium text-red-600">{uploadResult.error_count}</span>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-red-600 mb-2">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    {uploadResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isUploading || !selectedProduct || !file}>
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Accounts
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
