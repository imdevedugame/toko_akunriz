import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute("SELECT * FROM indosmm_services WHERE id = ?", [params.id])

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({ service: (rows as any[])[0] })
  } catch (error) {
    console.error("Get service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      service_id,
      name,
      category,
      rate,
      min_order,
      max_order,
      user_rate,
      reseller_rate,
      image_url,
      description,
      status,
    } = body

    // Check if service exists
    const [existingRows] = await db.execute("SELECT id FROM indosmm_services WHERE id = ?", [params.id])

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check for duplicate service_id (excluding current service)
    if (service_id) {
      const [duplicateRows] = await db.execute("SELECT id FROM indosmm_services WHERE service_id = ? AND id != ?", [
        service_id,
        params.id,
      ])

      if ((duplicateRows as any[]).length > 0) {
        return NextResponse.json({ error: "Service ID already exists" }, { status: 400 })
      }
    }

    // Build update query dynamically
    const updateFields = []
    const updateValues = []

    if (service_id !== undefined) {
      updateFields.push("service_id = ?")
      updateValues.push(service_id)
    }
    if (name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(name)
    }
    if (category !== undefined) {
      updateFields.push("category = ?")
      updateValues.push(category)
    }
    if (rate !== undefined) {
      updateFields.push("rate = ?")
      updateValues.push(Number.parseFloat(rate))
    }
    if (min_order !== undefined) {
      updateFields.push("min_order = ?")
      updateValues.push(Number.parseInt(min_order))
    }
    if (max_order !== undefined) {
      updateFields.push("max_order = ?")
      updateValues.push(Number.parseInt(max_order))
    }
    if (user_rate !== undefined) {
      updateFields.push("user_rate = ?")
      updateValues.push(Number.parseFloat(user_rate))
    }
    if (reseller_rate !== undefined) {
      updateFields.push("reseller_rate = ?")
      updateValues.push(Number.parseFloat(reseller_rate))
    }
    if (image_url !== undefined) {
      updateFields.push("image_url = ?")
      updateValues.push(image_url)
    }
    if (description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(description)
    }
    if (status !== undefined) {
      updateFields.push("status = ?")
      updateValues.push(status)
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(params.id)

    const updateQuery = `UPDATE indosmm_services SET ${updateFields.join(", ")} WHERE id = ?`

    await db.execute(updateQuery, updateValues)

    // Get updated service
    const [updatedRows] = await db.execute("SELECT * FROM indosmm_services WHERE id = ?", [params.id])

    return NextResponse.json({
      message: "Service updated successfully",
      service: (updatedRows as any[])[0],
    })
  } catch (error) {
    console.error("Update service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if service exists
    const [existingRows] = await db.execute("SELECT id FROM indosmm_services WHERE id = ?", [params.id])

    if ((existingRows as any[]).length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if service is being used in orders
    const [orderRows] = await db.execute("SELECT id FROM indosmm_orders WHERE indosmm_service_id = ?", [params.id])

    if ((orderRows as any[]).length > 0) {
      return NextResponse.json({ error: "Cannot delete service that has been used in orders" }, { status: 400 })
    }

    await db.execute("DELETE FROM indosmm_services WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Delete service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
