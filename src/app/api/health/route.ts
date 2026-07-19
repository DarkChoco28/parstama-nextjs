import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, string> = {}
  let healthy = true

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = "ok"
  } catch {
    checks.database = "error"
    healthy = false
  }

  try {
    checks.groq_api = process.env.GROQ_API_KEY ? "configured" : "missing_key"
    checks.resend_api = process.env.RESEND_API_KEY ? "configured" : "missing_key"
    checks.google_ai = process.env.GOOGLE_AI_API_KEY ? "configured" : "missing_key"
  } catch {
    checks.env = "error"
  }

  return NextResponse.json({
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  }, { status: healthy ? 200 : 503 })
}
