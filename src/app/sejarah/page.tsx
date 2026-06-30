"use client"

import Link from "next/link"
import RocketButton from "@/components/landing/RocketButton"

const milestones = [
  { year: "2018", title: "Berdirinya PARSTAMA", desc: "Palang Merah Remaja SMKN 1 Singosari resmi didirikan oleh sekelompok siswa yang memiliki semangat kepedulian tinggi terhadap sesama." },
  { year: "2019", title: "Pelatihan P3K Pertama", desc: "PARSTAMA mengadakan pelatihan P3K perdana yang diikuti oleh puluhan siswa, membekali mereka keterampilan dasar pertolongan pertama." },
  { year: "2020", title: "Adaptasi di Masa Pandemi", desc: "Di tengah pandemi COVID-19, PARSTAMA beradaptasi dengan kegiatan virtual dan tetap aktif dalam aksi kemanusiaan, membagikan masker dan handsanitizer." },
  { year: "2021", title: "Ekspansi Keanggotaan", desc: "Jumlah anggota meningkat signifikan. PARSTAMA mulai aktif dalam kegiatan palang merah tingkat kabupaten dan provinsi." },
  { year: "2022", title: "Juara Lomba Palang Merah", desc: "PARSTAMA meraih prestasi membanggakan dalam kompetisi palang merah remaja tingkat provinsi Jawa Timur." },
  { year: "2023", title: "Program Donor Darah", desc: "Launching program donor darah rutin yang melibatkan siswa, guru, dan masyarakat sekitar sekolah." },
  { year: "2024", title: "Digitalisasi & Website", desc: "PARSTAMA membangun kehadiran digital dengan website resmi untuk pendaftaran online, blog kesehatan, dan chat AI." },
  { year: "2025", title: "Era Baru PARSTAMA", desc: "Dengan anggota baru yang bergabung, PARSTAMA terus berkomitmen menjadi organisasi kemanusiaan yang terdepan di SMKN 1 Singosari." },
]

export default function SejarahPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Hero */}
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 no-underline">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-display font-extrabold mb-4">
            Sejarah <span className="bg-linear-to-r from-red-400 via-orange-400 to-red-600 bg-clip-text text-transparent">PARSTAMA</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
            Perjalanan panjang Palang Merah Remaja SMKN 1 Singosari dalam membentuk generasi peduli dan tanggap terhadap kemanusiaan.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative">
          {/* Garis vertikal */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[2px] bg-linear-to-b from-red-600 via-red-500/40 to-transparent" />

          {milestones.map((m, i) => (
            <div key={i} className={`relative flex items-start gap-6 sm:gap-8 mb-12 sm:mb-16 last:mb-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
              {/* Dot */}
              <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border-4 border-[#0A0A0B] z-10 shadow-[0_0_12px_rgba(220,38,38,0.5)]" />

              {/* Content */}
              <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:text-right sm:pr-8" : "sm:text-left sm:pl-8"}`}>
                <span className="inline-block px-3 py-1 rounded-full bg-red-600/15 border border-red-500/20 text-red-400 text-xs font-bold mb-2">
                  {m.year}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{m.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 sm:mt-24">
          <p className="text-zinc-400 text-sm mb-6">Bagian sejarah selanjutnya ditulis oleh kamu</p>
          <RocketButton href="/daftar" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm font-bold text-white bg-linear-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
            Daftar Sekarang
          </RocketButton>
        </div>
      </div>
    </div>
  )
}
