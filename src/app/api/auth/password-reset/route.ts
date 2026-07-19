import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const rl = await checkRateLimit(`password-reset:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." }, { status: 429 })
  }

  const body = await request.json()
  const { email } = body as { email: string }

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (!user) {
    return NextResponse.json({ message: "Jika email terdaftar, link reset telah dikirim." })
  }

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://parstama.my.id"}/reset-password?token=${token}`

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password - PARSTAMA",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a1c">Reset Password</h2>
          <p>Halo ${user.name},</p>
          <p>Kamu meminta reset password. Klik tombol di bawah dalam 1 jam:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#E87A1A;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;margin:16px 0">Reset Password</a>
          <p style="color:#666;font-size:13px">Jika kamu tidak meminta ini, abaikan email ini.</p>
        </div>
      `,
    })
  } catch {
    console.error("Failed to send password reset email")
  }

  return NextResponse.json({ message: "Jika email terdaftar, link reset telah dikirim." })
}
