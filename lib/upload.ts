import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import type { NextRequest } from "next/server"

export async function uploadFiles(request: NextRequest, maxFiles = 5): Promise<string[]> {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`)
    }

    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (file.size === 0) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
      const filepath = join(uploadDir, filename)

      await writeFile(filepath, buffer)
      uploadedFiles.push(`/uploads/${filename}`)
    }

    return uploadedFiles
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload files")
  }
}
