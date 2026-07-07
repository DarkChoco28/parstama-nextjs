import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { sendEmail, buildStatusEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { registrationId } = body

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID wajib diisi" }, { status: 400 })
    }

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
    })

    if (!reg) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
    }

    if (!reg.email) {
      return NextResponse.json({ error: "Pendaftar tidak memiliki email" }, { status: 400 })
    }

    const status = reg.status as "accepted" | "rejected" | "pending"
    const { subject, html } = buildStatusEmail(
      reg.fullName,
      reg.class,
      reg.major,
      reg.whatsapp,
      reg.email,
      status
    )

    await sendEmail({ to: reg.email, subject, html })

    return NextResponse.json({ message: "Email berhasil dikirim" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim email" },
      { status: 500 }
    )
  }
}
