import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "parentConsent" BOOLEAN NOT NULL DEFAULT false
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "motivationScore" INTEGER
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "sentimentLabel" TEXT
    `)
    return NextResponse.json({ success: true, message: "Schema synced!" })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal sync schema" }, { status: 500 })
  }
}
