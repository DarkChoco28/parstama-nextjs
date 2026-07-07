import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params

  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        religion: true,
        address: true,
        city: true,
        class: true,
        major: true,
        bloodType: true,
        medicalHistory: true,
        organizationExperience: true,
        motivation: true,
        motivationScore: true,
        sentimentLabel: true,
        status: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        suggestion: "pending",
        score: 5,
        reasoning: "AI review belum tersedia. Groq API key tidak terkonfigurasi.",
        strengths: [],
        concerns: [],
      })
    }

    const prompt = `Kamu adalah asisten admin PARSTAMA (Palang Merah Remaja). Analisis data pendaftaran berikut dan berikan rekomendasi.

DATA PENDAFTAR:
- Nama: ${registration.fullName}
- Gender: ${registration.gender === "L" ? "Laki-laki" : "Perempuan"}
- Agama: ${registration.religion || "-"}
- Kelas: ${registration.class}
- Jurusan: ${registration.major}
- Golongan Darah: ${registration.bloodType || "-"}
- Riwayat Medis: ${registration.medicalHistory || "Tidak ada"}
- Pengalaman Organisasi: ${registration.organizationExperience || "Tidak ada"}
- Motivasi: ${registration.motivation}
- Skor Motivasi: ${registration.motivationScore || "belum dinilai"}/10
- Sentimen: ${registration.sentimentLabel || "belum dinilai"}
- Status saat ini: ${registration.status}

KRITERIA PENILAIAN:
1. Kesungguhan motivasi (panjang & kualitas tulisan)
2. Pengalaman organisasi (relevansi dengan PMR)
3. Kelengkapan data
4. Potensi komitmen

Berikan jawaban dalam format JSON:
{
  "suggestion": "accept" | "reject" | "pending",
  "score": <1-10>,
  "reasoning": "<alasan singkat dalam Bahasa Indonesia>",
  "strengths": ["<kekuatan 1>", "<kekuatan 2>"],
  "concerns": ["<kekhawatiran 1>", "<kekhawatiran 2>"]
}

Hanya jawab JSON tanpa penjelasan tambahan.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Kamu adalah asisten review pendaftaran PMR. Jawab dalam JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({
        suggestion: "pending",
        score: 5,
        reasoning: "Gagal memanggil AI. Coba lagi.",
        strengths: [],
        concerns: [],
      })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ""

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        suggestion: ["accept", "reject", "pending"].includes(result.suggestion) ? result.suggestion : "pending",
        score: Math.max(1, Math.min(10, parseInt(result.score) || 5)),
        reasoning: result.reasoning || "Tidak ada alasan",
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        concerns: Array.isArray(result.concerns) ? result.concerns : [],
      })
    }

    return NextResponse.json({
      suggestion: "pending",
      score: 5,
      reasoning: "AI memberikan response yang tidak dapat diproses. Coba lagi.",
      strengths: [],
      concerns: [],
    })
  } catch (error) {
    return NextResponse.json(
      { suggestion: "pending", score: 5, reasoning: "Terjadi kesalahan server.", strengths: [], concerns: [] },
      { status: 500 }
    )
  }
}
