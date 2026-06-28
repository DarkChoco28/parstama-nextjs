import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")
  const csrfToken = String(formData.get("csrfToken") || "")

  const steps: Record<string, any> = { email, csrfTokenReceived: !!csrfToken }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    steps.userFound = !!user
    if (user) {
      steps.isAdmin = user.isAdmin
      steps.hashStart = user.password.substring(0, 10)
      const valid = await bcrypt.compare(password, user.password)
      steps.passwordValid = valid
    }
  } catch (e: any) {
    steps.dbError = e.message
  }

  try {
    const { getServerSession } = await import("next-auth")
    const { authOptions } = await import("@/lib/auth-options")
    const session = await getServerSession(authOptions)
    steps.hasSession = !!session
  } catch (e: any) {
    steps.sessionError = e.message
  }

  return NextResponse.json(steps)
}
