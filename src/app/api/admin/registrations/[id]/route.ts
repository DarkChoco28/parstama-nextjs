import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { sendEmail, buildStatusEmail } from "@/lib/email"
import { sendWhatsApp, buildStatusWhatsApp } from "@/lib/whatsapp"
import { createAuditLog } from "@/lib/audit-log"
import { statusUpdateSchema } from "@/lib/validation"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const registration = await prisma.registration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pendaftaran" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = statusUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { status } = parsed.data

    const oldReg = await prisma.registration.findUnique({ where: { id } })
    if (!oldReg) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: { status },
    })

    createAuditLog({
      action: `update_registration_status:${status}`,
      userEmail: auth.session?.user?.email || "unknown",
      details: `Mengubah status ${oldReg.fullName} (${oldReg.class} ${oldReg.major}) dari ${oldReg.status} ke ${status}`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })

    // Auto-send email when status changes to accepted or rejected
    let emailStatus = "skip"
    let emailError = null
    if (
      registration.email &&
      oldReg.status !== status &&
      (status === "accepted" || status === "rejected")
    ) {
      try {
        const { subject, html } = buildStatusEmail(
          registration.fullName,
          registration.class,
          registration.major,
          registration.whatsapp,
          registration.email,
          status as "accepted" | "rejected"
        )
        await sendEmail({ to: registration.email, subject, html })
        emailStatus = "sent"
        console.log(`Email notif terkirim ke ${registration.email} (${status})`)
      } catch (err: any) {
        emailStatus = "failed"
        emailError = err?.message || "Gagal mengirim email"
        console.error("Gagal kirim email notif:", emailError)
      }
    }

    // Auto-send WhatsApp when status changes to accepted or rejected
    let waStatus = "skip"
    let waError = null
    if (
      registration.whatsapp &&
      oldReg.status !== status &&
      (status === "accepted" || status === "rejected")
    ) {
      try {
        const message = buildStatusWhatsApp(
          registration.fullName,
          registration.class,
          registration.major,
          registration.whatsapp,
          registration.email || "",
          status as "accepted" | "rejected"
        )
        await sendWhatsApp({ target: registration.whatsapp, message })
        waStatus = "sent"
        console.log(`WA notif terkirim ke ${registration.fullName} (${status})`)
      } catch (err: any) {
        waStatus = "failed"
        waError = err?.message || "Gagal mengirim WhatsApp"
        console.error("Gagal kirim WA notif:", waError)
      }
    }

    return NextResponse.json({
      ...registration,
      _emailStatus: emailStatus,
      _emailError: emailError,
      _waStatus: waStatus,
      _waError: waError,
    })
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate status pendaftaran" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const reg = await prisma.registration.findUnique({ where: { id } })
    await prisma.registration.delete({
      where: { id },
    })

    createAuditLog({
      action: "delete_registration",
      userEmail: auth.session?.user?.email || "unknown",
      details: `Menghapus pendaftaran ${reg?.fullName || id}`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })

    return NextResponse.json({ message: "Pendaftaran berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus pendaftaran" },
      { status: 500 }
    )
  }
}
