import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

const PANITIA_WHATSAPP = "6281932781179"

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

      const message = encodeURIComponent(
        `Halo Admin PMR PARSTAMA! 🏥\n\nAda pendaftar baru:\n\n` +
        `👤 *${reg.fullName}* (${reg.nickname || "-"})\n` +
        `📱 WA: ${reg.whatsapp}\n` +
        `📧 Email: ${reg.email || "-"}\n` +
        `🏫 Kelas: ${reg.class} - ${reg.major}\n` +
        `📅 ${new Date(reg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n\n` +
        `Silakan cek dashboard admin untuk detail lengkap.`
      )

      return NextResponse.json({
        url: `https://wa.me/${PANITIA_WHATSAPP}?text=${message}`,
        message: "Link WhatsApp notif pendaftar baru",
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
          nickname: true,
          whatsapp: true,
          email: true,
          class: true,
          major: true,
          status: true,
        },
      })

      const broadcastMessage = encodeURIComponent(
        `Assalamu'alaikum Wr. Wb. 🙏\n\n` +
        `Kepada Yth. Anggota PMR PARSTAMA\n\n` +
        `Dengan ini kami informasikan bahwa:\n` +
        `Total pendaftar: *${registrations.length} orang*\n` +
        `Status: ${status ? status.toUpperCase() : "SEMUA STATUS"}\n\n` +
        `Silakan cek dashboard untuk informasi lebih lanjut.\n\n` +
        `Terima kasih.\n` +
        `Hormat kami,\n` +
        `Admin PMR PARSTAMA`
      )

      return NextResponse.json({
        url: `https://wa.me/${PANITIA_WHATSAPP}?text=${broadcastMessage}`,
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
