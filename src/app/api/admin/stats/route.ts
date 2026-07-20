import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const [total, pending, accepted, rejected] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "pending" } }),
      prisma.registration.count({ where: { status: "accepted" } }),
      prisma.registration.count({ where: { status: "rejected" } }),
    ])

    return NextResponse.json({ total, pending, accepted, rejected })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 })
  }
}
