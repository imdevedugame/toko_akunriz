import { mkdir, stat } from "fs/promises"
import { createWriteStream } from "fs"
import { join } from "path"
import { Readable } from "stream"
import { exec } from "child_process"
import type { NextRequest } from "next/server"

export async function uploadFiles(request: NextRequest, maxFiles = 5): Promise<string[]> {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`)
    }

    const uploadDir = join(process.cwd(), "public", "uploads")
    await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }))

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (file.size === 0) continue

      const timestamp = Date.now()
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "")
      const filename = `${timestamp}-${sanitized}`
      const filepath = join(uploadDir, filename)

      const stream = createWriteStream(filepath)
      const buffer = Buffer.from(await file.arrayBuffer())

      await new Promise<void>((resolve, reject) => {
        Readable.from(buffer).pipe(stream)
          .on("finish", resolve)
          .on("error", reject)
      })

      // Tambahkan: ubah owner file ke www-data
      await new Promise<void>((resolve, reject) => {
        exec(`chown www-data:www-data "${filepath}"`, (err) => {
          if (err) {
            console.error("❌ Gagal chown:", err)
            return reject(err)
          }
          console.log(`✅ Berhasil chown ${filename} ke www-data`)
          resolve()
        })
      })

      uploadedFiles.push(`/uploads/${filename}`)
    }

    return uploadedFiles
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload files")
  }
}

export async function uploadServiceImages(request: NextRequest, maxFiles = 5): Promise<string[]> {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`)
    }

    // Folder tujuan: public/images/services
    const uploadDir = join(process.cwd(), "public", "images", "services")
    await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }))

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (file.size === 0) continue

      const timestamp = Date.now()
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "")
      const filename = `${timestamp}-${sanitized}`
      const filepath = join(uploadDir, filename)

      const stream = createWriteStream(filepath)
      const buffer = Buffer.from(await file.arrayBuffer())

      await new Promise<void>((resolve, reject) => {
        Readable.from(buffer).pipe(stream)
          .on("finish", resolve)
          .on("error", reject)
      })

      // Opsional: ubah owner file ke www-data (khusus Linux server)
      await new Promise<void>((resolve, reject) => {
        exec(`chown www-data:www-data "${filepath}"`, (err) => {
          if (err) {
            console.error("❌ Gagal chown:", err)
            return reject(err)
          }
          console.log(`✅ Berhasil chown ${filename} ke www-data`)
          resolve()
        })
      })

      // Path yang bisa digunakan di frontend
      uploadedFiles.push(`/images/services/${filename}`)
    }

    return uploadedFiles
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload service images")
  }
}
