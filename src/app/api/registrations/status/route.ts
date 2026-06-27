import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { whatsapp, birthDate } = await request.json()

    if (!whatsapp || typeof whatsapp !== "string" || whatsapp.trim().length < 10) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid (minimal 10 digit)" },
        { status: 400 }
      )
    }

    if (!birthDate || typeof birthDate !== "string") {
      return NextResponse.json(
        { error: "Tanggal lahir wajib diisi" },
        { status: 400 }
      )
    }

    const normalizedWhatsapp = whatsapp.replace(/\D/g, "")
    const searchDate = new Date(birthDate)

    if (isNaN(searchDate.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal lahir tidak valid" },
        { status: 400 }
      )
    }

    const registration = await prisma.registration.findFirst({
      where: {
        whatsapp: normalizedWhatsapp,
        birthDate: searchDate,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        nickname: true,
        class: true,
        major: true,
        status: true,
        createdAt: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        {
          found: false,
          message: "Data pendaftaran tidak ditemukan. Pastikan nomor WhatsApp dan tanggal lahir yang dimasukkan sama seperti saat mendaftar.",
        },
        { status: 200 }
      )
    }

    const statusMessages: Record<string, string> = {
      accepted:
        "Selamat, pendaftaran Anda dinyatakan diterima. Silakan pantau informasi lanjutan dari panitia PMR PARSTAMA.",
      rejected:
        "Pendaftaran Anda saat ini dinyatakan belum lolos. Jika membutuhkan klarifikasi, silakan hubungi panitia.",
      pending:
        "Pendaftaran Anda sudah tercatat dan sedang menunggu proses verifikasi panitia.",
    }

    return NextResponse.json({
      found: true,
      data: {
        ...registration,
        createdAt: registration.createdAt.toISOString(),
      },
      message: statusMessages[registration.status] || statusMessages.pending,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memeriksa status" },
      { status: 500 }
    )
  }
}
