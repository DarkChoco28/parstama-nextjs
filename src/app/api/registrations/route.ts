import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "")
}

async function scoreMotivation(text: string): Promise<{ score: number; label: string }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { score: 5, label: "netral" }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Analisis sentimen teks motivasi pendaftaran PMR. Berikan JSON: {"score": <1-10>, "label": "<positif|netral|negatif>}. Score berdasarkan: kesungguhan, kejelasan tujuan, antusiasme, panjang teks. Hanya jawab JSON tanpa penjelasan.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    })

    if (!res.ok) return { score: 5, label: "netral" }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ""
    const match = content.match(/\{[^}]+\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      const score = Math.max(1, Math.min(10, parseInt(parsed.score) || 5))
      const label = ["positif", "netral", "negatif"].includes(parsed.label) ? parsed.label : "netral"
      return { score, label }
    }
    return { score: 5, label: "netral" }
  } catch {
    return { score: 5, label: "netral" }
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed } = checkRateLimit(`reg:${ip}`, 5, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." }, { status: 429 })
  }

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
        status: "pending",
      },
    })

    // Auto-score motivation sentiment (non-blocking)
    scoreMotivation(motivation.trim()).then(({ score, label }) => {
      prisma.registration.update({
        where: { id: registration.id },
        data: { motivationScore: score, sentimentLabel: label },
      }).catch(() => {})
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
