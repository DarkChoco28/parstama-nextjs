import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { findRelevantChunks } from "@/lib/embedding"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

const PAGES_TO_CRAWL = [
  { path: "/", label: "Beranda" },
  { path: "/sejarah", label: "Sejarah" },
  { path: "/faq", label: "FAQ" },
  { path: "/struktur-organisasi", label: "Struktur Organisasi" },
  { path: "/cek-status", label: "Cek Status / Tanya AI" },
]

let cachedContent: string | null = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000

let cachedMembers: string | null = null
let membersCacheTime = 0
const MEMBERS_CACHE_TTL = 5 * 60 * 1000

async function fetchOrganizationMembers(): Promise<string> {
  if (cachedMembers && Date.now() - membersCacheTime < MEMBERS_CACHE_TTL) {
    return cachedMembers
  }

  try {
    const members = await prisma.organizationMember.findMany({
      where: { isVisible: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
      select: { name: true, nickname: true, position: true, bio: true, level: true, period: true },
    })

    if (members.length === 0) {
      cachedMembers = ""
      membersCacheTime = Date.now()
      return ""
    }

    const levelLabels: Record<number, string> = { 0: "Ketua Umum", 1: "Ketua Satu", 2: "Pengurus Inti", 3: "Humas" }

    const lines = members.map(m => {
      const levelName = levelLabels[m.level] || "Anggota"
      const nick = m.nickname ? ` (${m.nickname})` : ""
      const bio = m.bio ? ` — ${m.bio}` : ""
      return `- ${m.name}${nick}: ${m.position} [${levelName}]${bio}`
    })

    const period = members[0]?.period || "2026/2027"
    cachedMembers = `Struktur Organisasi PARSTAMA Periode ${period}:\n${lines.join("\n")}`
    membersCacheTime = Date.now()
    return cachedMembers
  } catch {
    cachedMembers = ""
    membersCacheTime = Date.now()
    return ""
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchWebsiteContent(): Promise<string> {
  if (cachedContent && Date.now() - cacheTime < CACHE_TTL) {
    return cachedContent
  }

  const chunks: string[] = []

  for (const page of PAGES_TO_CRAWL) {
    try {
      const res = await fetch(`${SITE_URL}${page.path}`, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const html = await res.text()
      const text = stripHtml(html)
      if (text.length > 50) {
        chunks.push(`[${page.label}]\n${text.slice(0, 3000)}`)
      }
    } catch {
      // skip failed pages
    }
  }

  cachedContent = chunks.join("\n\n---\n\n")
  cacheTime = Date.now()
  return cachedContent
}

const knowledgeBase: KnowledgeEntry[] = [
  {
    patterns: ["cara daftar", "gimana cara daftar", "bagaimana cara daftar", "mau daftar", "ingin daftar", "daftar pmr", "pendaftaran pmr", "form pendaftaran", "formulir pendaftaran", "gabung pmr", "join pmr", "masuk pmr", "cara mendaftar", "gimana cara mendaftar", "bagaimana cara mendaftar", "mau mendaftar", "ingin mendaftar", "mendaftar pmr"],
    response: "Untuk mendaftar PARSTAMA:\n\n1️⃣ Buka halaman utama, klik **\"Daftar Sekarang\"**\n2️⃣ Isi **Data Diri** — nama, jenis kelamin, tempat/tanggal lahir, agama\n3️⃣ Isi **Kontak & Sekolah** — alamat, WhatsApp, email, kelas, jurusan\n4️⃣ Isi **Motivasi** — riwayat organisasi & motivasi bergabung\n5️⃣ **Konfirmasi** — centang persetujuan orang tua, kirim\n\nSemua online, gratis, dan simpel! 📱",
  },
  {
    patterns: ["syarat daftar", "persyaratan", "ketentuan daftar", "apa saja syarat", "syarat pendaftaran", "ketentuan pendaftaran"],
    response: "Syarat daftar PARSTAMA:\n\n✅ Siswa aktif **SMKN 1 Singosari**\n✅ Punya semangat kepedulian & jiwa sukarela\n✅ Bersedia ikut seluruh rangkaian seleksi\n✅ Mendapat **izin orang tua/wali**\n✅ Punya minat dan tujuan yang jelas\n\nKalau sudah cocok, langsung daftar! 💪",
  },
  {
    patterns: ["biaya daftar", "berapa biaya", "daftar berapa", "bayar daftar", "uang pendaftaran", "gratis atau tidak", "dipungut biaya", "mahal ga", "mahal gak", "bayar ga", "bayar gak"],
    response: "Pendaftaran PARSTAMA **GRATIS** alias tidak dipungut biaya apapun! 🎉\n\nYang perlu disiapkan:\n• Data diri lengkap\n• Nomor WhatsApp aktif\n• Izin orang tua\n\nHati-hati kalau ada yang minta bayaran — itu bukan panitia kami!",
  },
  {
    patterns: ["cek status", "status daftar", "status pendaftaran", "hasil daftar", "sudah daftar", "uda daftar", "sudah mendaftar", "uda mendaftar"],
    response: "Untuk cek status pendaftaran:\n\n1️⃣ Hubungi panitia via **WhatsApp: 0814-5914-5800**\n2️⃣ Sebutkan **nama lengkap** & **nomor WhatsApp** yang dipakai daftar\n\nStatus:\n🟡 **Pending** — masih diproses\n🟢 **Diterima** — selamat! 🎉\n🔴 **Ditolak** — coba lagi tahun depan",
  },
  {
    patterns: ["diterima", "ditolak", "pending", "status pending", "status diterima", "status ditolak"],
    response: "Penjelasan status pendaftaran:\n\n🟡 **Pending** — pendaftaranmu sedang diverifikasi oleh panitia. Sabar ya!\n🟢 **Diterima** — kamu diterima di PARSTAMA! 🎉\n🔴 **Ditolak** — belum beruntung, bisa coba lagi tahun depan\n\nUntuk info lebih lanjut, hubungi panitia: **WA 0814-5914-5800**",
  },
  {
    patterns: ["timeline", "jadwal daftar", "kapan daftar", "kapan dibuka", "waktu pendaftaran", "seleksi", "pengumuman", "jadwal seleksi"],
    response: "Timeline PARSTAMA:\n\n📅 **Pendaftaran** — dibuka setiap tahun ajaran baru\n📅 **Seleksi** — proses seleksi oleh tim panitia\n📅 **Pengumuman** — via WhatsApp & website\n📅 **Pelatihan** — dimulai setelah pengumuman\n\nPantau terus website ini untuk info terbaru! 📢",
  },
  {
    patterns: ["kontak panitia", "hubungi panitia", "nomor wa panitia", "no hp panitia", "whatsapp panitia", "nomor telepon panitia", "kontak pmr"],
    response: "Kontak panitia PARSTAMA:\n\n📱 **WhatsApp**: 0814-5914-5800\n🏫 **Sekolah**: SMKN 1 Singosari\n\nJam aktif: **Senin–Jumat, 08.00–16.00 WIB**\n\nLangsung chat aja, fast respon! 😊",
  },
  {
    patterns: ["tentang pmr", "apa itu pmr", "parstama", "pmr itu apa", "tentang parstama", "parstama itu apa", "kegiatan parstama"],
    response: "**PARSTAMA** adalah ekstrakurikuler Palang Merah Remaja di SMKN 1 Singosari.\n\nKegiatan kami:\n🎯 Pelatihan **PPGD** (Pertolongan Pertama Gawat Darurat)\n🤝 Bakti sosial & donor darah\n🏆 Kompetisi PMR kecamatan/kota/nasional\n📚 Pengembangan diri & kepemimpinan\n🎖️ Sertifikasi resmi dari **PMI**\n\nBukan sekadar organisasi — kami keluarga! ❤️",
  },
  {
    patterns: ["jumlah anggota", "berapa anggota", "anggota aktif", "member pmr", "berapa member"],
    response: "PARSTAMA punya **100+ anggota aktif** dari berbagai jurusan di SMKN 1 Singosari.\n\nTertarik gabung? Yuk daftar sekarang! 🤝",
  },
  {
    patterns: ["lokasi", "alamat sekolah", "dimana smkn", "alamat smkn", "lokasi pmr", "lokasi parstama", "alamat parstama"],
    response: "Lokasi PARSTAMA:\n\n🏫 **SMKN 1 Singosari**\n📍 Singosari, Malang, Jawa Timur\n\nDatang langsung aja, atau hubungi panitia: **WA 0814-5914-5800** 📱",
  },
  {
    patterns: ["ppgd", "pertolongan pertama gawat darurat", "pertolongan pertama", "first aid", "penanganan darurat", "gawat darurat"],
    response: "**PPGD** (Pertolongan Pertama Gawat Darurat) adalah tindakan awal sebelum bantuan medis profesional tiba.\n\nPrinsip:\n1️⃣ **Pastikan keamanan** — cek area aman\n2️⃣ **Cek respons** — goyangkan bahu, panggil korban\n3️⃣ **Panggil 119** (darurat medis)\n4️⃣ **Lakukan PPGD** sesuai kondisi\n\nIngat: **Keselamatan diri nomor satu!** 🛡️",
  },
  {
    patterns: ["luka berdarah", "luka sobek", "luka robek", "perdarahan", "darah keluar", "darah banyak", "luka terbuka", "luka dalam"],
    response: "Penanganan **luka berdarah**:\n\n**Luka ringan (gores):**\n1. Cuci dengan air mengalir\n2. Beri antiseptik (betadine)\n3. Tutup dengan plester/kasa steril\n\n**Luka berat (banyak darah):**\n1. **Tekan** luka dengan kain bersih\n2. **Angkat** bagian tubuh lebih tinggi\n3. **Jangan cabut** benda asing yang menancap\n4. Segera ke fasyankes / hubungi **119**\n\n⚠️ Jangan pakai obat sembarangan pada luka terbuka!",
  },
  {
    patterns: ["patah tulang", "fracture", "tulang patah", "tulang retak", "cedera tulang", "tulang bengkok"],
    response: "Penanganan **patah tulang**:\n\n**Tanda:**\n• Nyeri hebat saat digerakkan\n• Bengkak & memar\n• Bentuk abnormal\n\n**Langkah:**\n1. **Jangan gerakkan** bagian cedera\n2. **Immobilisasi** dengan bidai/splint\n3. Kompres dingin untuk kurangi bengkak\n4. Segera ke **fasyankes**\n\n⚠️ **Jangan coba luruskan tulang sendiri!**",
  },
  {
    patterns: ["luka bakar", "burn", "terbakar", "kena air panas", "kena api", "kulit melepuh", "kebakaran"],
    response: "Penanganan **luka bakar**:\n\n**Ringan:**\n1. Alirkan **air mengalir suhu ruangan** selama **10–20 menit**\n2. **Jangan pakai** es, odol, minyak!\n3. Tutup dengan kasa steril\n\n**Berat:**\n1. **Jangan lepaskan** pakaian yang menempel\n2. Tutup dengan kain bersih\n3. Segera ke fasyankes / hubungi **119**\n\n🔑 **Air mengalir, bukan air es!**",
  },
  {
    patterns: ["pingsan", "tidak sadarkan diri", "pengsan", "collapse", "tiba-tiba pingsan", "pingsan mendadak"],
    response: "Penanganan **pingsan**:\n\n1. **Pastikan area aman**\n2. **Periksa napas**\n3. **Hubungi 119** segera\n4. Jika bernapas: posisi **recovery position** (miring)\n5. Jika TIDAK bernapas: mulai **RJP**\n\n⚠️ **Jangan:** siramkan air ke wajah, memaksa korban bangun",
  },
  {
    patterns: ["rjp", "cpr", "resusitasi jantung", "jantung berhenti", "napas berhenti", "tidak bernapas"],
    response: "**RJP (Resusitasi Jantung Paru):**\n\n**Kapan:** Korban tidak merespons + TIDAK bernapas\n\n**Langkah:**\n1. Pastikan **keamanan area**\n2. **Cek respons**\n3. Hubungi **119**\n4. **Kompresi dada:**\n   • Tumit tangan di tengah dada\n   • Kedalaman: **5–6 cm**\n   • Kecepatan: **100–120x/menit**\n5. Rasio: **30 kompresi : 2 napas**\n\n🎵 Ikuti irama **\"Stayin' Alive\"**!",
  },
  {
    patterns: ["asma", "sesak nafas", "sesak napas", "mengi", "inhaler"],
    response: "Penanganan **serangan asma**:\n\n1. **Dudukkan** korban (tegap)\n2. Bantu pakai **inhaler** jika punya\n3. Bawa ke tempat **teduh & bersih**\n4. Tarik napas **pelan & teratur**\n5. Tidak membaik 15 menit → **hubungi 119**\n\n⚠️ **Jangan berbaring!**",
  },
  {
    patterns: ["serangan jantung", "heart attack", "nyeri dada", "dada sesak", "dada nyeri", "jantung sakit"],
    response: "Penanganan **serangan jantung**:\n\n**Tanda:**\n• Nyeri dada seperti **ditekan/diremas**\n• Nyeri menjalar ke lengan kiri, rahang\n• Sesak napas, keringat dingin\n\n**Langkah:**\n1. **Hubungi 119 SEGERA**\n2. Baringkan **setengah duduk**\n3. Beri **aspirin** (kunyah, jika tidak alergi)\n4. Siapkan RJP jika pingsan\n\n⚠️ **Waktu = nyawa!**",
  },
  {
    patterns: ["demam", "panas badan", "fever", "suhu tinggi", "meriang", "menggigil"],
    response: "Penanganan **demam**:\n\n1. **Kompres** dahi dengan air hangat\n2. Minum **air putih** banyak\n3. Istirahat di tempat **sejuk**\n4. Minum **parasetamol** jika perlu\n\n⚠️ **Segera ke dokter jika:** demam > 40°C, kejang, lebih dari 3 hari",
  },
  {
    patterns: ["donor darah", "donor", "donor plasma"],
    response: "**Donor Darah** di PARSTAMA:\n\nKegiatan rutin bekerja sama dengan **PMI**.\n\n**Syarat donor:**\n✅ Usia 17–65 tahun\n✅ Berat badan ≥ 45 kg\n✅ Tekanan darah normal\n\nInfo jadwal: **WA 0814-5914-5800** 📱",
  },
  {
    patterns: ["darurat", "nomor darurat", "emergency", "nomor telepon darurat", "nomor penting"],
    response: "Nomor **DARURAT** Indonesia:\n\n🚑 **119** — Darurat Medis\n🚔 **110** — Kepolisian\n🚒 **113** — Pemadam Kebakaran",
  },
  {
    patterns: ["hai", "halo", "hello", "hi", "hey", "permisi", "assalamualaikum", "selamat pagi", "selamat siang", "selamat sore", "selamat malam"],
    response: "**Halo!** 👋 Selamat datang di AI Assistant **PARSTAMA**.\n\nAku bisa bantu:\n📋 **Pendaftaran** — cara daftar, syarat, biaya\n🏥 **Medis** — PPGD, luka, patah tulang, RJP, dll\n❓ **Tanya apa aja** tentang PARSTAMA\n\nKetik pertanyaanmu! 💬",
  },
  {
    patterns: ["siapa kamu", "kamu siapa", "nama kamu", "apa ini", "kamu siapa"],
    response: "Aku **AI Assistant PARSTAMA** 🤖\n\nAku bantu jawab pertanyaan tentang:\n• **Pendaftaran PARSTAMA**\n• **Penanganan medis darurat**\n• **Pengetahuan kesehatan**\n\nUntuk darurat, hubungi **119**! 🏥",
  },
  {
    patterns: ["terima kasih", "thanks", "makasih", "thx", "sip", "ok mantap"],
    response: "Sama-sama! 😊 Senang bisa membantu.\n\nAda pertanyaan lain? 💬",
  },
  {
    patterns: ["bantu", "help", "tolong", "bisa apa", "kamu bisa apa"],
    response: "Tentu! Aku bisa bantu:\n\n📋 **Pendaftaran:**\n• Cara daftar, syarat, biaya\n\n🏥 **Medis & PPGD:**\n• Luka, patah tulang, luka bakar, RJP\n• Serangan jantung, asma, demam\n\n💬 Tanya aja, gratis! 🆓",
  },
  {
    patterns: ["siapa ketua", "ketua parstama", "ketua umum", "siapa ketua umum", "siapa ketua satu", "ketua satunya"],
    response: "Untuk info lengkap tentang **struktur organisasi** PARSTAMA, silakan kunjungi:\n\n🌐 **parstama.my.id/struktur-organisasi**\n\nAtau hubungi panitia: **WA 0814-5914-5800** 📱",
  },
  {
    patterns: ["siapa dafiq", "dafiq", "mas dafiq", "siapa mas dafiq"],
    response: "**Mas Dafiq** adalah salah satu pengurus **PARSTAMA** di SMKN 1 Singosari.\n\nUntuk info lebih lanjut, hubungi langsung:\n📱 **WA: 0814-5914-5800**",
  },
  {
    patterns: ["siapa fiona", "fiona", "mbak fiona", "siapa mbak fiona"],
    response: "**Mbak Fiona** adalah salah satu pengurus **PARSTAMA** di SMKN 1 Singosari.\n\nUntuk info lebih lanjut, hubungi langsung:\n📱 **WA: 0838-2379-7912**",
  },
  {
    patterns: ["struktur organisasi", "pengurus parstama", "siapa saja pengurus", "anggota inti", "pengurus inti"],
    response: "Untuk info lengkap tentang **struktur organisasi** PARSTAMA:\n\n🌐 Kunjungi: **parstama.my.id/struktur-organisasi**\n📱 Atau hubungi panitia: **WA 0814-5914-5800**",
  },
  {
    patterns: ["humas parstama", "siapa humas", "kontak humas"],
    response: "Hubungan Masyarakat (Humas) PARSTAMA:\n\n📱 **Mas Dafiq**: 0814-5914-5800\n📱 **Mbak Fiona**: 0838-2379-7912\n\nSilakan hubungi salah satu! 😊",
  },
]

function findFallbackResponse(input: string): string {
  const lower = input.toLowerCase().trim()
  let bestMatch: KnowledgeEntry | null = null
  let bestScore = 0

  for (const entry of knowledgeBase) {
    let score = 0
    let matchCount = 0
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        score += pattern.length * 3
        matchCount++
        if (lower === pattern) score += pattern.length * 2
      }
    }
    if (matchCount > 0 && score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestMatch && bestScore > 5) return bestMatch.response

  return "Maaf, AI sedang tidak bisa memproses pertanyaanmu saat ini. 😅\n\nCoba lagi dalam beberapa saat, atau tanyakan langsung ke panitia:\n📱 **WA: 0814-5914-5800**"
}

const BASE_SYSTEM_PROMPT = `Kamu adalah AI Assistant PARSTAMA di SMKN 1 Singosari. Nama kamu PARSTAMA AI.

Kamu adalah AI yang serbaguna dan bisa menjawab SEMUA pertanyaan dengan bebas — tanpa batasan topik.

ATURAN:
- Jawab dalam Bahasa Indonesia yang ramah, natural, dan informatif
- Kamu BOLEH dan HARUS menjawab pertanyaan apapun: teknologi, sains, sejarah, budaya, geografi, olahraga, entertainment, saran, curhat, coding, dll
- Jika ditanya tentang penanganan medis darurat, selalu tekankan hubungi 119
- Format pesan pakai **bold** untuk penekanan
- Bersikaplah seperti teman yang suka bantu, bukan robot kaku
- Gunakan emoji yang sesuai
- Jika tidak tahu jawaban yang akurat, akui dengan jujur dan sarankan sumber yang tepat
- Untuk pertanyaan umum (bukan tentang PARSTAMA), jawab dari pengetahuan umummu seakurat mungkin
- Jika ada pertanyaan tentang website/organisasi ini, gunakan KONTeks YANG DIBERIKAN sebagai sumber utama
- Selalu sebutkan bahwa untuk info resmi PARSTAMA, hubungi panitia via WA 0814-5914-5800

PENTING: Kamu adalah AI general-purpose. Jangan pernah menolak menjawab pertanyaan yang bukan tentang PARSTAMA. Jawab semua pertanyaan dengan pengetahuan luas yang kamu miliki.`

interface KnowledgeEntry {
  patterns: string[]
  response: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body as { message: string }

    if (!message?.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ response: findFallbackResponse(message), _debug: "NO_API_KEY" })
    }

    try {
      let contextBlock = ""

      const ragChunks = await findRelevantChunks(message, 10, prisma).catch(() => [])

      if (ragChunks.length > 0) {
        const contextParts = ragChunks.map((c, i) => `[${i + 1}] (${c.category}/${c.source || "umum"}, relevance: ${(c.similarity * 100).toFixed(0)}%)\n${c.content}`)
        contextBlock = `\n\n--- KONTEKS RELEVAN (berdasarkan pencarian semantik) ---\n${contextParts.join("\n\n")}\n--- AKHIR KONTEKS ---`
      } else {
        const [websiteContent, orgMembers] = await Promise.all([
          fetchWebsiteContent(),
          fetchOrganizationMembers(),
        ])

        if (orgMembers) {
          contextBlock += `\n\n--- DATA STRUKTUR ORGANISASI PARSTAMA ---\n${orgMembers}\n--- AKHIR DATA ORGANISASI ---`
        }

        if (websiteContent) {
          contextBlock += `\n\n--- KONTEN WEBSITE PARSTAMA ---\n${websiteContent}\n--- AKHIR KONTEN WEBSITE ---`
        }
      }

      const systemPrompt = BASE_SYSTEM_PROMPT + contextBlock

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.8,
          max_tokens: 2048,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Groq API error: ${res.status}`)
      }

      const data = await res.json()
      const response = data.choices?.[0]?.message?.content
      if (!response) throw new Error("Empty response from Groq")

      return NextResponse.json({ response, _rag: ragChunks.length > 0, _chunks: ragChunks.length })
    } catch (groqError: unknown) {
      const groqMsg = groqError instanceof Error ? groqError.message : String(groqError)
      console.error("Groq error, using fallback:", groqMsg)
      return NextResponse.json({ response: findFallbackResponse(message), _debug: "GROQ_ERROR", _error: groqMsg })
    }
  } catch (error: unknown) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { response: findFallbackResponse("") },
      { status: 500 }
    )
  }
}
