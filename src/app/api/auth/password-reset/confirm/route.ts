import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token, password } = body as { token: string; password: string }

  if (!token || !password) {
    return NextResponse.json({ error: "Token dan password wajib diisi" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
    return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
  ])

  return NextResponse.json({ message: "Password berhasil diubah. Silakan login." })
}
