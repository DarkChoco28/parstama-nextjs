import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { registrationSchema } from "@/lib/validation"

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "")
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const rl = await checkRateLimit(`registration:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const normalizedWhatsapp = normalizeWhatsapp(data.whatsapp)

    const setting = await prisma.setting.findUnique({
      where: { key: "registration_open" },
    })

    if (setting && setting.value === "0") {
      return NextResponse.json(
        { error: "Pendaftaran sedang ditutup" },
        { status: 400 }
      )
    }

    const existingWhatsapp = await prisma.registration.findUnique({
      where: { whatsapp: normalizedWhatsapp },
    })

    if (existingWhatsapp) {
      return NextResponse.json(
        { error: "Nomor WhatsApp ini sudah pernah digunakan untuk mendaftar" },
        { status: 400 }
      )
    }

    const normalizedEmail = data.email?.trim() || null
    if (normalizedEmail) {
      const existingEmail = await prisma.registration.findUnique({
        where: { email: normalizedEmail },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 400 }
        )
      }
    }

    const registration = await prisma.registration.create({
      data: {
        fullName: data.fullName.trim(),
        nickname: data.nickname?.trim() || null,
        gender: data.gender,
        birthPlace: data.birthPlace.trim(),
        birthDate: new Date(data.birthDate),
        religion: data.religion?.trim() || null,
        address: data.address.trim(),
        city: data.city?.trim() || null,
        province: data.province?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        whatsapp: normalizedWhatsapp,
        email: normalizedEmail,
        class: data.class.trim(),
        major: data.major.trim(),
        bloodType: data.bloodType || null,
        medicalHistory: data.medicalHistory?.trim() || null,
        organizationExperience: data.organizationExperience?.trim() || null,
        motivation: data.motivation.trim(),
        status: "pending",
      },
    })

    return NextResponse.json(
      { message: "Pendaftaran berhasil", registration },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    )
  }
}
