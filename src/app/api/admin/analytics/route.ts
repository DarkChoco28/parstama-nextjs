import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length
  if (n === 0) return { slope: 0, intercept: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const { x, y } of data) {
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x
  }
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

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

    // Pendaftar per hari (7 hari terakhir)
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

    // === PHASE 2: Sentiment Analysis ===
    const sentimentDistribution = await prisma.registration.groupBy({
      by: ["sentimentLabel"],
      _count: { sentimentLabel: true },
      _avg: { motivationScore: true },
      where: { sentimentLabel: { not: null } },
    })

    const sentimentData = sentimentDistribution.map(s => ({
      label: s.sentimentLabel || "belum dinilai",
      count: s._count.sentimentLabel,
      avgScore: s._avg.motivationScore ? Math.round(s._avg.motivationScore * 10) / 10 : null,
    }))

    // Sentiment per jurusan
    const sentimentByMajor = await prisma.registration.groupBy({
      by: ["major", "sentimentLabel"],
      _count: { major: true },
      _avg: { motivationScore: true },
      where: { sentimentLabel: { not: null } },
    })

    // === PHASE 3: Trend Prediction ===
    // Last 30 days daily counts for prediction
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyRaw: { x: number; y: number; label: string }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      const count = await prisma.registration.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      })
      dailyRaw.push({
        x: 29 - i,
        y: count,
        label: dayStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      })
    }

    // Linear regression for prediction
    const regression = linearRegression(dailyRaw.map(d => ({ x: d.x, y: d.y })))

    // Predict next 7 days
    const predictionData: { date: string; predicted: number; actual: number | null }[] = []
    for (let i = 0; i < 30 + 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - 29 + i)
      const label = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      const predicted = Math.max(0, Math.round(regression.slope * i + regression.intercept))

      if (i < 30) {
        predictionData.push({ date: label, predicted, actual: dailyRaw[i]?.y ?? 0 })
      } else {
        predictionData.push({ date: label, predicted, actual: null })
      }
    }

    // Moving average (7-day)
    const movingAvg: (number | null)[] = []
    for (let i = 0; i < dailyRaw.length; i++) {
      if (i < 6) {
        movingAvg.push(null)
      } else {
        const window = dailyRaw.slice(i - 6, i + 1)
        const avg = window.reduce((s, d) => s + d.y, 0) / 7
        movingAvg.push(Math.round(avg * 10) / 10)
      }
    }

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
      // Phase 2: Sentiment
      sentiment: {
        distribution: sentimentData,
        byMajor: sentimentByMajor.map(s => ({
          major: s.major,
          label: s.sentimentLabel,
          count: s._count.major,
          avgScore: s._avg.motivationScore ? Math.round(s._avg.motivationScore * 10) / 10 : null,
        })),
      },
      // Phase 3: Prediction
      prediction: {
        daily: predictionData,
        movingAverage: movingAvg,
        trend: {
          slope: Math.round(regression.slope * 1000) / 1000,
          intercept: Math.round(regression.intercept * 100) / 100,
          direction: regression.slope > 0.05 ? "naik" : regression.slope < -0.05 ? "turun" : "stabil",
        },
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
