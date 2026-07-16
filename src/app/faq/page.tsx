"use client"

import Link from "next/link"
import { FaqAccordion } from "@/components/ui/FaqAccordion"

const faqItems = [
  {
    question: "Apa itu website PARSTAMA?",
    answer: "Website PARSTAMA adalah portal resmi Palang Merah Remaja SMKN 1 Singosari. Website ini menyediakan berbagai fitur seperti pendaftaran anggota online, status pendaftar, blog artikel kesehatan, kalender event, AI Chat (Tanya AI), struktur organisasi, dan informasi seputar PARSTAMA.",
  },
  {
    question: "Fitur apa saja yang tersedia?",
    answer: "Fitur utama website PARSTAMA meliputi: (1) Pendaftaran anggota online multi-step, (2) Status pendaftar, (3) Blog artikel kesehatan, (4) Kalender event kegiatan, (5) AI Chat/Tanya AI berbasis Groq, (6) Struktur organisasi, (7) Sejarah PARSTAMA, (8) Export data backup untuk admin.",
  },
  {
    question: "Bagaimana cara mendaftar anggota PMR lewat website?",
    answer: "Kunjungi halaman /daftar, lalu ikuti 4 langkah pendaftaran: (1) Data Pribadi — isi nama, gender, tempat/tanggal lahir, alamat, (2) Kontak — isi WhatsApp, email, (3) Data Akademik — kelas, jurusan, golongan darah, (4) Motivasi — tulis alasan ingin bergabung. Setelah selesai, kamu akan mendapat notifikasi konfirmasi.",
  },
  {
    question: "Apa itu status pendaftar?",
    answer: "Status pendaftar adalah informasi mengenai apakah pendaftaran kamu sudah diproses oleh admin PARSTAMA. Setelah mendaftar, kamu akan mendapat notifikasi perubahan status melalui email dan WhatsApp dari admin.",
  },
  {
    question: "Apa itu AI Chat / Tanya AI?",
    answer: "AI Chat atau Tanya AI adalah fitur chatbot berbasis Groq AI (Llama 3.3 70B) yang bisa menjawab pertanyaan seputar PMR, PARSTAMA, pendaftaran, kesehatan, dan informasi lainnya. Kamu bisa mengaksesnya di halaman /cek-status. Fitur ini juga mendukung upload gambar untuk analisis P3K (vision).",
  },
  {
    question: "Blog dan Event fungsinya untuk apa?",
    answer: "Blog berisi artikel-artikel kesehatan dan informasi seputar PMR yang bisa dibaca oleh umum. Event menampilkan kalender kegiatan PARSTAMA seperti diklat, donor darah, bakti sosial, dan kegiatan lainnya. Keduanya bisa diakses tanpa login.",
  },
  {
    question: "Apakah website ini bisa diakses dari HP?",
    answer: "Ya, website PARSTAMA didesain responsif dan bisa diakses dari HP, tablet, maupun desktop. Tampilan akan menyesuaikan dengan ukuran layar perangkatmu. Menu navigasi mobile tersedia di bagian bawah layar.",
  },
  {
    question: "Bagaimana cara login ke admin panel?",
    answer: "Kunjungi halaman /login, masukkan email dan password admin yang terdaftar. Admin panel digunakan untuk mengelola data pendaftaran, artikel blog, event, anggota organisasi, pengaturan website, dan melihat analytics.",
  },
  {
    question: "Apakah data pendaftaran saya aman?",
    answer: "Data pendaftaran disimpan di database PostgreSQL (Neon) yang aman dan terenkripsi. Hanya admin yang memiliki akses untuk melihat data pendaftaran. Kami tidak akan membagikan data pribadimu ke pihak ketiga.",
  },
  {
    question: "Bagaimana cara menghubungi admin PARSTAMA?",
    answer: "Kamu bisa menghubungi admin PARSTAMA melalui WhatsApp di +62 814-5914-5800 atau email ke pmr.parstama@gmail.com. Untuk pertanyaan seputar pendaftaran, kamu juga bisa gunakan fitur Tanya AI yang tersedia di website.",
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,122,26,0.08)_0%,transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 no-underline">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-display font-extrabold mb-4">
            Pertanyaan <span className="bg-linear-to-r from-orange-400 via-orange-400 to-orange-600 bg-clip-text text-transparent">Umum</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
            Jawaban atas pertanyaan yang sering diajukan seputar website PARSTAMA.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-[#141415] border border-white/6 rounded-2xl p-4 sm:p-8">
          <FaqAccordion
            items={faqItems}
            title=""
          />
        </div>
      </div>
    </div>
  )
}
