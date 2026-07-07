import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { registrationSchema } from "@/lib/validation"

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "")
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed } = await checkRateLimit(`register:${ip}`, 5, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      fullName,
      nickname,
      gender,
      birthPlace,
      birthDate,
      religion,
      address,
      city,
      province,
      postalCode,
      whatsapp,
      email,
      class: className,
      major,
      bloodType,
      medicalHistory,
      organizationExperience,
      motivation,
      parentConsent,
    } = parsed.data

    const normalizedWhatsapp = normalizeWhatsapp(String(whatsapp || ""))
    if (normalizedWhatsapp.length < 10 || normalizedWhatsapp.length > 20) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid" },
        { status: 400 }
      )
    }

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
        {
          error:
            "Nomor WhatsApp ini sudah pernah digunakan untuk mendaftar",
        },
        { status: 400 }
      )
    }

    const normalizedEmail = email?.trim() || null
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
        fullName: fullName.trim(),
        nickname: nickname?.trim() || null,
        gender,
        birthPlace: birthPlace.trim(),
        birthDate: new Date(birthDate),
        religion: religion?.trim() || null,
        address: address.trim(),
        city: city?.trim() || null,
        province: province?.trim() || null,
        postalCode: postalCode?.trim() || null,
        whatsapp: normalizedWhatsapp,
        email: normalizedEmail,
        class: className.trim(),
        major: major.trim(),
        bloodType: bloodType?.trim() || null,
        medicalHistory: medicalHistory?.trim() || null,
        organizationExperience: organizationExperience?.trim() || null,
        motivation: motivation.trim(),
        parentConsent: !!parentConsent,
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
