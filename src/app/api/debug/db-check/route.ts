import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")
    const dbUrl = process.env.DATABASE_URL || ""
    const masked = dbUrl.length > 30 ? dbUrl.substring(0, 25) + "..." : "not set"
    let userCount = 0
    let adminExists = false
    try {
      userCount = await prisma.user.count()
      const admin = await prisma.user.findUnique({ where: { email: "admin@parstama.id" }, select: { email: true } })
      adminExists = !!admin
    } catch (e: any) {
      return NextResponse.json({ error: "DB error: " + e.message, dbUrl: masked })
    }
    return NextResponse.json({ dbUrl: masked, userCount, adminExists })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
