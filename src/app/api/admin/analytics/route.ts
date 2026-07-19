import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const now = new Date()

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 6)
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [today, thisWeek, thisMonth] = await Promise.all([
      prisma.registration.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.registration.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.registration.count({ where: { createdAt: { gte: startOfMonth } } }),
    ])

    const dailyData: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      const count = await prisma.registration.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      })
      dailyData.push({
        date: dayStart.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
        count,
      })
    }

    const majorDistribution = await prisma.registration.groupBy({
      by: ["major"],
      _count: { major: true },
      orderBy: { _count: { major: "desc" } },
    })

    const [pending, accepted, rejected] = await Promise.all([
      prisma.registration.count({ where: { status: "pending" } }),
      prisma.registration.count({ where: { status: "accepted" } }),
      prisma.registration.count({ where: { status: "rejected" } }),
    ])

    const [totalArticles, publishedArticles, totalViews] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.article.aggregate({ _sum: { viewCount: true }, where: { isPublished: true } }),
    ])

    const totalEvents = await prisma.event.count()
    const totalMembers = await prisma.organizationMember.count({ where: { isVisible: true } })
    const totalComments = await prisma.blogComment.count()
    const pendingComments = await prisma.blogComment.count({ where: { isApproved: false } })

    return NextResponse.json({
      today,
      thisWeek,
      thisMonth,
      dailyData,
      majorDistribution: majorDistribution.map((m) => ({
        name: m.major,
        value: m._count.major,
      })),
      statusSummary: { pending, accepted, rejected },
      blog: {
        totalArticles,
        publishedArticles,
        totalViews: totalViews._sum.viewCount || 0,
        totalComments,
        pendingComments,
      },
      overview: {
        totalRegistrations: pending + accepted + rejected,
        totalEvents,
        totalMembers,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data analytics" },
      { status: 500 }
    )
  }
}
