import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { uploadFiles, uploadServiceImages } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get("type") || "general"

    let uploadedFiles

    if (type === "services") {
      uploadedFiles = await uploadServiceImages(request, 5)
    } else {
      uploadedFiles = await uploadFiles(request, 5)
    }

    return NextResponse.json({
      message: "Upload successful",
      type,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
