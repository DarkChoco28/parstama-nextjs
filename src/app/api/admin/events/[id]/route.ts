import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 })
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Gagal mengambil event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, location, startDate, endDate, allDay, color, category, isVisible } = body

    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (description !== undefined) data.description = description?.trim() || null
    if (location !== undefined) data.location = location?.trim() || null
    if (startDate !== undefined) data.startDate = new Date(startDate)
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null
    if (allDay !== undefined) data.allDay = allDay
    if (color !== undefined) data.color = color
    if (category !== undefined) data.category = category
    if (isVisible !== undefined) data.isVisible = isVisible

    const event = await prisma.event.update({ where: { id }, data })
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Gagal mengupdate event" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Gagal menghapus event" }, { status: 500 })
  }
}
