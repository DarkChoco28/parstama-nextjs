import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { buildStatusWhatsApp } from "@/lib/whatsapp"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "single"
    const registrationId = searchParams.get("id")

    if (type === "single" && registrationId) {
      const reg = await prisma.registration.findUnique({
        where: { id: registrationId },
      })

      if (!reg) {
        return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
      }

      const message = buildStatusWhatsApp(
        reg.fullName,
        reg.class,
        reg.major,
        reg.whatsapp,
        reg.email || "",
        reg.status as "accepted" | "rejected" | "pending"
      )

      let cleanNumber = reg.whatsapp.replace(/[^0-9]/g, "")
      if (cleanNumber.startsWith("0")) cleanNumber = "62" + cleanNumber.slice(1)
      if (!cleanNumber.startsWith("62")) cleanNumber = "62" + cleanNumber
      return NextResponse.json({
        url: `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`,
        message: `Link WA ke ${reg.fullName}`,
      })
    }

    if (type === "broadcast") {
      const status = searchParams.get("status")
      const where: any = {}
      if (status) where.status = status

      const registrations = await prisma.registration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          whatsapp: true,
          status: true,
        },
      })

      const broadcastMessage = encodeURIComponent(
        `Halo Anggota PARSTAMA 👋\n\n` +
        `Kepada Yth. Anggota PARSTAMA\n\n` +
        `Dengan ini kami informasikan bahwa:\n` +
        `Total pendaftar: *${registrations.length} orang*\n` +
        `Status: ${status ? status.toUpperCase() : "SEMUA STATUS"}\n\n` +
        `Silakan cek dashboard untuk informasi lebih lanjut.\n\n` +
        `Terima kasih.\n` +
        `Hormat kami,\n` +
        `Admin PARSTAMA`
      )

      return NextResponse.json({
        url: `https://wa.me/?text=${broadcastMessage}`,
        count: registrations.length,
        message: "Link WhatsApp broadcast",
      })
    }

    return NextResponse.json({ error: "Parameter tidak valid" }, { status: 400 })
  } catch (error) {
    console.error("Error generating WhatsApp link:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat generate link WhatsApp" },
      { status: 500 }
    )
  }
}
