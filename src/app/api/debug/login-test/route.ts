import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { prisma } = await import("@/lib/prisma")

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "User not found" })
    if (!user.isAdmin) return NextResponse.json({ error: "Not admin" })

    const valid = await bcrypt.compare(password, user.password)
    return NextResponse.json({ valid, passwordHashStart: user.password.substring(0, 10) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 })
  }
}
