import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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
    } = body

    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi" },
        { status: 400 }
      )
    }

    if (!gender || !["L", "P"].includes(gender)) {
      return NextResponse.json(
        { error: "Jenis kelamin wajib dipilih" },
        { status: 400 }
      )
    }

    if (!birthPlace?.trim() || !birthDate) {
      return NextResponse.json(
        { error: "Tempat dan tanggal lahir wajib diisi" },
        { status: 400 }
      )
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { error: "Alamat wajib diisi" },
        { status: 400 }
      )
    }

    const normalizedWhatsapp = normalizeWhatsapp(String(whatsapp || ""))
    if (normalizedWhatsapp.length < 10 || normalizedWhatsapp.length > 20) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid" },
        { status: 400 }
      )
    }

    if (!className?.trim() || !major?.trim()) {
      return NextResponse.json(
        { error: "Kelas dan jurusan wajib diisi" },
        { status: 400 }
      )
    }

    if (!motivation?.trim() || motivation.trim().length < 20) {
      return NextResponse.json(
        { error: "Motivasi minimal 20 karakter" },
        { status: 400 }
      )
    }

    if (!parentConsent) {
      return NextResponse.json(
        {
          error:
            "Persetujuan orang tua / wali wajib disetujui sebelum mengirim pendaftaran",
        },
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
        parentConsent: parentConsent === true,
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
