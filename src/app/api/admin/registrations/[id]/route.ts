import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { sendEmail, buildStatusEmail } from "@/lib/email"
import { buildStatusWhatsApp } from "@/lib/whatsapp"

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
    const { status } = body

    const oldReg = await prisma.registration.findUnique({ where: { id } })
    if (!oldReg) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: { status },
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

    // Generate WhatsApp URL when status changes to accepted or rejected
    let waUrl = null
    let waStatus = "skip"
    if (
      registration.whatsapp &&
      oldReg.status !== status &&
      (status === "accepted" || status === "rejected")
    ) {
      const message = buildStatusWhatsApp(
        registration.fullName,
        registration.class,
        registration.major,
        registration.whatsapp,
        registration.email || "",
        status as "accepted" | "rejected"
      )
      let cleanNumber = registration.whatsapp.replace(/[^0-9]/g, "")
      if (cleanNumber.startsWith("0")) cleanNumber = "62" + cleanNumber.slice(1)
      if (!cleanNumber.startsWith("62")) cleanNumber = "62" + cleanNumber
      waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
      waStatus = "ready"
    }

    return NextResponse.json({
      ...registration,
      _emailStatus: emailStatus,
      _emailError: emailError,
      _waUrl: waUrl,
      _waStatus: waStatus,
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
    await prisma.registration.delete({
      where: { id },
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
