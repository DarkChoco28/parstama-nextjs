import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const where: Record<string, unknown> = { isVisible: true }
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.startDate = { gte: start, lte: end }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      select: { id: true, title: true, description: true, location: true, startDate: true, endDate: true, allDay: true, color: true, category: true },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Gagal mengambil event" }, { status: 500 })
  }
}
