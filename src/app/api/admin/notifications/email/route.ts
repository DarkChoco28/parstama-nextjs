import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { sendEmail, buildStatusEmail } from "@/lib/email"
import { statusUpdateSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const parsed = statusUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { registrationId } = parsed.data

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
  } catch {
    console.error("Error sending email")
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim email" },
      { status: 500 }
    )
  }
}
