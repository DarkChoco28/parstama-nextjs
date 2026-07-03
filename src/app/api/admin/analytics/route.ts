import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const now = new Date()

    // Hari ini
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const today = await prisma.registration.count({
      where: { createdAt: { gte: startOfDay } },
    })

    // Minggu ini (7 hari terakhir)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 6)
    startOfWeek.setHours(0, 0, 0, 0)
    const thisWeek = await prisma.registration.count({
      where: { createdAt: { gte: startOfWeek } },
    })

    // Bulan ini
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = await prisma.registration.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    // Pendaftar per hari (7 hari terakhir) — single query
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 6)
    weekAgo.setHours(0, 0, 0, 0)
    const dailyRaw: { date: Date; count: bigint }[] = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Registration"
      WHERE "createdAt" >= ${weekAgo}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `
    const countMap = new Map(dailyRaw.map((r) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date)
      return [d.toDateString(), Number(r.count)]
    }))
    const dailyData: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const key = dayStart.toDateString()
      dailyData.push({
        date: dayStart.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
        count: countMap.get(key) || 0,
      })
    }

    // Distribusi jurusan
    const majorDistribution = await prisma.registration.groupBy({
      by: ["major"],
      _count: { major: true },
      orderBy: { _count: { major: "desc" } },
    })

    // Distribusi status per jurusan
    const statusByMajor = await prisma.registration.groupBy({
      by: ["major", "status"],
      _count: { major: true },
      orderBy: { major: "asc" },
    })

    // Status counts
    const [pending, accepted, rejected] = await Promise.all([
      prisma.registration.count({ where: { status: "pending" } }),
      prisma.registration.count({ where: { status: "accepted" } }),
      prisma.registration.count({ where: { status: "rejected" } }),
    ])

    return NextResponse.json({
      today,
      thisWeek,
      thisMonth,
      dailyData,
      majorDistribution: majorDistribution.map((m) => ({
        name: m.major,
        value: m._count.major,
      })),
      statusByMajor,
      statusSummary: { pending, accepted, rejected },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data analytics" },
      { status: 500 }
    )
  }
}
