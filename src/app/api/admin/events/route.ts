import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const where: any = { isVisible: true }
    if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }]
    if (category) where.category = category

    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { startDate: "asc" }, skip: (page - 1) * limit, take: limit }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({ events, pagination: { page, totalPages: Math.ceil(total / limit), total } })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Gagal mengambil data event" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { title, description, location, startDate, endDate, allDay, color, category, isVisible } = body

    if (!title?.trim() || !startDate) {
      return NextResponse.json({ error: "Judul dan tanggal wajib diisi" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay ?? false,
        color: color || "#DC2626",
        category: category || "Kegiatan",
        isVisible: isVisible ?? true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Gagal membuat event" }, { status: 500 })
  }
}
