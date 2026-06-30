"use client"

import Link from "next/link"
import RocketButton from "@/components/landing/RocketButton"

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

      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-16 sm:space-y-20">

        {/* Pendirian */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Pendirian</h2>
          </div>
          <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              PARSTAMA (<span className="text-white font-semibold">Palang Merah Remaja STM Negeri Malang</span>) yang sekarang berada di SMKN 1 Singosari didirikan pada tanggal <span className="text-red-400 font-semibold">28 Oktober 1992</span> tepat saat hari Sumpah Pemuda oleh <span className="text-white font-semibold">Bpk Ali Sukoco Spd</span> pembina OSIS pada waktu itu.
            </p>
          </div>
        </section>

        {/* Kegiatan */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Kegiatan</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Rutin */}
            <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-bold">Rutin</span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                PARSTAMA selalu melakukan kegiatan rutin setiap tahunnya, seperti diklat anggota, penempuhan pin, donor darah, dan latihan rutin.
              </p>
            </div>
            {/* Tidak Rutin */}
            <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs font-bold">Tidak Rutin</span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Kegiatan tidak rutin lainnya seperti anjangsana, diklat gabungan, GKAB dan lain-lain.
              </p>
            </div>
          </div>
        </section>

        {/* Sekretariat */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Sekretariat</h2>
          </div>
          <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Kesekertariatan PARSTAMA berada di kampus SMKN 1 Singosari di <span className="text-white font-semibold">Jl Raya Mondoroko No 03 Singosari Malang</span>.
            </p>
          </div>
        </section>

        {/* Perjalanan */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Perjalanan</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Masa Kejayaan */}
            <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 text-xs font-bold">Masa Kejayaan</span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                PARSTAMA pernah mengalami masa kejayaan dimana PARSTAMA dikenal oleh banyak anggota palang merah remaja lainnya di seluruh Malang Raya.
              </p>
            </div>
            {/* Masa Sulit */}
            <div className="bg-[#141415] border border-white/6 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/15 border border-zinc-500/20 text-zinc-400 text-xs font-bold">Masa Sulit</span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Tetapi belakangan ini PARSTAMA mengalami banyak kendala untuk mengikuti kegiatan-kegiatan di luar sekolah.
              </p>
            </div>
          </div>
        </section>

        {/* Harapan */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Harapan</h2>
          </div>
          <div className="bg-[#141415] border border-red-500/10 rounded-2xl p-6 sm:p-8">
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Kami sangat mengharapkan bantuan saudara sekalian untuk berpartisipasi dalam pengembangan organisasi kami. Dan untuk itu kami selaku admin mengucapkan banyak terima kasih.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-white/6">
          <p className="text-zinc-400 text-sm mb-6">Bagian sejarah selanjutnya ditulis oleh kamu</p>
          <RocketButton href="/daftar" className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-full text-sm font-bold text-white bg-linear-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Daftar Sekarang
          </RocketButton>
        </div>
      </div>
    </div>
  )
}
