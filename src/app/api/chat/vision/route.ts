import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { WA_NUMBER } from "@/lib/constants"
import { visionSchema } from "@/lib/validation"

const VISION_PROMPT = `Kamu adalah AI ahli P3K (Pertolongan Pertama Gawat Darurat) PARSTAMA.

Analisis gambar yang dikirim pengguna dan berikan panduan pertolongan pertama.

Format jawaban:
1. **Identifikasi**: Jelaskan apa yang terlihat pada gambar (luka, kondisi, dll)
2. **Penanganan**: Langkah-langkah pertolongan pertama yang harus dilakukan
3. **Peringatan**: Kapan harus ke fasyankes/hubungi 119

Aturan:
- Jawab dalam Bahasa Indonesia yang jelas dan mudah dipahami
- Selalu tekankan untuk hubungi 119 jika kondisi serius
- Gunakan format markdown dengan **bold** untuk penekanan
- Bersikaplah tenang dan profesional
- Jika gambar bukan terkait medis/P3K, tetap bantu dengan pertanyaan lain`

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed } = await checkRateLimit(`chat-vision:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = visionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { image, message } = parsed.data

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 })
    }
    const imageType = match[1]
    const base64Data = match[2]
    if (base64Data.length < 100) {
      return NextResponse.json({ error: "Data gambar terlalu kecil" }, { status: 400 })
    }
    console.log("[vision] imageType:", imageType, "size:", base64Data.length)

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        response: `Fitur analisis gambar belum tersedia. Silakan hubungi panitia via WhatsApp: ${WA_NUMBER} 📱`,
      })
    }

    const prompt = message
      ? `${VISION_PROMPT}\n\nPertanyaan tambahan pengguna: ${message}`
      : VISION_PROMPT

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:${imageType};base64,${base64Data}` },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Groq vision error: ${res.status}`)
    }

    const data = await res.json()
    const response = data.choices?.[0]?.message?.content
    if (!response) throw new Error("Empty response from Groq vision")

    return NextResponse.json({ response })
  } catch (error) {
    console.error("[vision] error:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      response: `Maaf, analisis gambar gagal. Coba kirim ulang atau ketik pertanyaan Anda secara manual.\n\nUntuk bantuan: **WA ${WA_NUMBER}** 📱`,
    })
  }
}
