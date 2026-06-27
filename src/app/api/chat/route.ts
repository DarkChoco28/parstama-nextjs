import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `Kamu adalah AI Assistant PMR PARSTAMA di SMKN 1 Singosari. Kamu membantu menjawab pertanyaan seputar pendaftaran PMR, pengetahuan medis/PPGD, dan informasi umum PMR.

INFORMASI PENTING:
- Pendaftaran PMR PARSTAMA: Gratis, buka setiap tahun ajaran baru
- Cara daftar: Buka halaman utama > Daftar Sekarang > isi 4 step (Data Diri, Kontak & Sekolah, Motivasi, Konfirmasi)
- Syarat: Siswa aktif SMKN 1 Singosari, semangat kepedulian, izin orang tua
- Kontak panitia: WhatsApp 0814-5914-5800 (Senin-Jumat 08.00-16.00 WIB)
- Lokasi: SMKN 1 Singosari, Malang, Jawa Timur
- Nomor darurat medis: 119
- PMR PARSTAMA adalah ekstrakurikuler Palang Merah Remaja
- Kegiatan: PPGD, donor darah, bakti sosial, kompetisi PMR

ATURAN:
- Jawab dalam Bahasa Indonesia yang ramah dan singkat
- Gunakan emoji yang sesuai
- Jika ditanya tentang penanganan medis, selalu tekankan untuk hubungi 119 dalam kondisi darurat
- Jika tidak tahu jawabannya, arahkan ke kontak panitia
- Format pesan pakai **bold** untuk penekanan
- Jangan mengarang informasi yang tidak kamu ketahui`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body as { message: string }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key belum dikonfigurasi" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    })

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
