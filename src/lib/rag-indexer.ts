import { prisma } from "./prisma"
import { generateEmbedding, chunkText } from "./embedding"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

async function insertEmbedding(content: string, category: string, source: string, embedding: number[]) {
  const embeddingStr = `[${embedding.join(",")}]`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "KnowledgeEmbedding" (id, content, category, source, embedding, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, now(), now())`,
    content, category, source, embeddingStr
  )
}

const PAGES_TO_CRAWL = [
  { path: "/", label: "Beranda" },
  { path: "/sejarah", label: "Sejarah" },
  { path: "/faq", label: "FAQ" },
  { path: "/struktur-organisasi", label: "Struktur Organisasi" },
  { path: "/cek-status", label: "Cek Status" },
]

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

interface IndexResult {
  websiteChunks: number
  memberChunks: number
  knowledgeChunks: number
  totalChunks: number
}

export async function rebuildIndex(): Promise<IndexResult> {
  await prisma.knowledgeEmbedding.deleteMany()

  const [websiteChunks, memberChunks, knowledgeChunks] = await Promise.all([
    indexWebsiteContent(),
    indexOrganizationMembers(),
    indexKnowledgeBase(),
  ])

  try {
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "KnowledgeEmbedding_embedding_idx" ON "KnowledgeEmbedding" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)`
    )
  } catch {
    // IVFFlat may fail with too few rows, that's OK
  }

  return {
    websiteChunks,
    memberChunks,
    knowledgeChunks,
    totalChunks: websiteChunks + memberChunks + knowledgeChunks,
  }
}

async function indexWebsiteContent(): Promise<number> {
  let totalChunks = 0

  for (const page of PAGES_TO_CRAWL) {
    try {
      const res = await fetch(`${SITE_URL}${page.path}`, { next: { revalidate: 300 } })
      if (!res.ok) continue
      const html = await res.text()
      const text = stripHtml(html)
      if (text.length < 50) continue

      const chunks = chunkText(text, 800, 100)
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk)
        await insertEmbedding(chunk, "website", page.label, embedding)
        totalChunks++
      }
    } catch {
      // skip failed pages
    }
  }

  return totalChunks
}

async function indexOrganizationMembers(): Promise<number> {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { isVisible: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    })

    if (members.length === 0) return 0

    const levelLabels: Record<number, string> = { 0: "Ketua Umum", 1: "Ketua Satu", 2: "Pengurus Inti", 3: "Humas" }

    let totalChunks = 0
    for (const m of members) {
      const levelName = levelLabels[m.level] || "Anggota"
      const nick = m.nickname ? ` (${m.nickname})` : ""
      const bio = m.bio ? `. ${m.bio}` : ""
      const text = `${m.name}${nick} adalah ${m.position} (${levelName}) periode ${m.period || "2026/2027"}.${bio}`

      const embedding = await generateEmbedding(text)
      await insertEmbedding(text, "member", `organisasi-${m.level}`, embedding)
      totalChunks++
    }
    return totalChunks
  } catch {
    return 0
  }
}

const KNOWLEDGE_ENTRIES = [
  { text: "Cara mendaftar PARSTAMA: Buka halaman utama, klik Daftar Sekarang, isi data diri (nama, jenis kelamin, tempat/tanggal lahir, agama), isi kontak & sekolah (alamat, WhatsApp, email, kelas, jurusan), isi motivasi (riwayat organisasi & motivasi bergabung), konfirmasi (centang persetujuan orang tua, kirim). Semua online, gratis.", source: "pendaftaran" },
  { text: "Syarat daftar PARSTAMA: Siswa aktif SMKN 1 Singosari, punya semangat kepedulian & jiwa sukarela, bersedia ikut seluruh rangkaian seleksi, mendapat izin orang tua/wali, punya minat dan tujuan yang jelas.", source: "pendaftaran" },
  { text: "Pendaftaran PARSTAMA GRATIS alias tidak dipungut biaya apapun. Yang perlu disiapkan: data diri lengkap, nomor WhatsApp aktif, izin orang tua.", source: "pendaftaran" },
  { text: "Cek status pendaftaran: Hubungi panitia via WhatsApp 0814-5914-5800. Sebutkan nama lengkap & nomor WhatsApp yang dipakai daftar. Status: Pending (masih diproses), Diterima, atau Ditolak.", source: "pendaftaran" },
  { text: "Timeline PARSTAMA: Pendaftaran dibuka setiap tahun ajaran baru. Seleksi oleh tim panitia. Pengumuman via WhatsApp & website. Pelatihan dimulai setelah pengumuman.", source: "pendaftaran" },
  { text: "Kontak panitia PARSTAMA: WhatsApp 0814-5914-5800, Sekolah SMKN 1 Singosari. Jam aktif Senin-Jumat 08.00-16.00 WIB.", source: "kontak" },
  { text: "PARSTAMA adalah ekstrakurikuler Palang Merah Remaja di SMKN 1 Singosari. Kegiatan: Pelatihan PPGD, bakti sosial & donor darah, kompetisi PMR kecamatan/kota/nasional, pengembangan diri & kepemimpinan, sertifikasi resmi dari PMI.", source: "tentang" },
  { text: "PARSTAMA punya 100+ anggota aktif dari berbagai jurusan di SMKN 1 Singosari.", source: "tentang" },
  { text: "Lokasi PARSTAMA: SMKN 1 Singosari, Singosari, Malang, Jawa Timur.", source: "lokasi" },
  { text: "PPGD (Pertolongan Pertama Gawat Darurat) adalah tindakan awal sebelum bantuan medis profesional tiba. Prinsip: Pastikan keamanan, cek respons, panggil 119, lakukan PPGD sesuai kondisi. Keselamatan diri nomor satu.", source: "ppgd" },
  { text: "Penanganan luka berdarah ringan: Cuci dengan air mengalir, beri antiseptik (betadine), tutup dengan plester/kasa steril. Luka berat: Tekan luka dengan kain bersih, angkat bagian tubuh lebih tinggi, jangan cabut benda asing, segera ke fasyankes atau hubungi 119.", source: "medis" },
  { text: "Penanganan patah tulang: Jangan gerakkan bagian cedera, immobilisasi dengan bidai/splint, kompres dingin untuk kurangi bengkak, segera ke fasyankes. Jangan coba luruskan tulang sendiri.", source: "medis" },
  { text: "Penanganan luka bakar ringan: Alirkan air mengalir suhu ruangan selama 10-20 menit. Jangan pakai es, odol, minyak. Tutup dengan kasa steril. Luka bakar berat: jangan lepaskan pakaian menempel, tutup dengan kain bersih, segera ke fasyankes.", source: "medis" },
  { text: "Penanganan pingsan: Pastikan area aman, periksa napas, hubungi 119. Jika bernapas: posisi recovery position (miring). Jika tidak bernapas: mulai RJP. Jangan siramkan air ke wajah atau memaksa korban bangun.", source: "medis" },
  { text: "RJP (Resusitasi Jantung Paru): Kapan - korban tidak merespons dan tidak bernapas. Langkah: pastikan keamanan, cek respons, hubungi 119, kompresi dada dengan tumit tangan di tengah dada, kedalaman 5-6cm, kecepatan 100-120x/menit, rasio 30 kompresi : 2 napas.", source: "medis" },
  { text: "Penanganan serangan asma: Dudukkan korban (tegap), bantu pakai inhaler jika punya, bawa ke tempat teduh & bersih, tarik napas pelan & teratur. Tidak membaik 15 menit → hubungi 119. Jangan berbaring.", source: "medis" },
  { text: "Penanganan serangan jantung: Tanda - nyeri dada seperti ditekan/diremas, menjalar ke lengan kiri, rahang, sesak napas, keringat dingin. Langkah: Hubungi 119 SEGERA, baringkan setengah duduk, beri aspirin (kunyah jika tidak alergi), siapkan RJP jika pingsan.", source: "medis" },
  { text: "Nomor darurat Indonesia: 119 Darurat Medis, 110 Kepolisian, 113 Pemadam Kebakaran.", source: "darurat" },
  { text: "Donor darah di PARSTAMA: Kegiatan rutin bekerja sama dengan PMI. Syarat: usia 17-65 tahun, berat badan minimal 45kg, tekanan darah normal.", source: "kegiatan" },
  { text: "Humas PARSTAMA: Mas Dafiq 0814-5914-5800, Mbak Fiona 0838-2379-7912.", source: "kontak" },
]

async function indexKnowledgeBase(): Promise<number> {
  let totalChunks = 0

  for (const entry of KNOWLEDGE_ENTRIES) {
    try {
      const embedding = await generateEmbedding(entry.text)
      await insertEmbedding(entry.text, "knowledge", entry.source, embedding)
      totalChunks++
    } catch {
      // skip failed entries
    }
  }

  return totalChunks
}
