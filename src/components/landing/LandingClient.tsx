"use client"

import { useEffect, useRef, useState, useCallback, type MouseEvent as ReactMouseEvent } from "react"
import Link from "next/link"
import FluidMenu from "./FluidMenu"
import Preloader from "./Preloader"
import RocketButton from "./RocketButton"

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible")
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function SplitText({ text, className = "", as: Tag = "span" }: { text: string; className?: string; as?: "span" | "a" | "p" | "div" }) {
  return (
    <Tag className={className}>
      {text.split("").map((char, i) => (
        <span key={i} className="split-char" style={{ transitionDelay: `${i * 25}ms` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  )
}

function BentoCard({ f }: { f: { icon: string; title: string; desc: string } }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const onMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({ x: (0.5 - y) * 12, y: (x - 0.5) * 12 })
  }, [])

  return (
    <div
      ref={cardRef}
      className="reveal-scale bento-card group relative bg-[#1A1A1C] border border-white/[0.06] rounded-2xl p-6 sm:p-8 overflow-hidden cursor-default"
      onMouseMove={onMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }) }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? "scale(1.02)" : "scale(1)"}`,
        transition: "transform 0.4s cubic-bezier(0.33,1,0.68,1), border-color 0.3s, box-shadow 0.3s",
        borderColor: isHovered ? "rgba(220,38,38,0.3)" : undefined,
        boxShadow: isHovered ? "0 0 40px rgba(220,38,38,0.08), 0 20px 60px rgba(0,0,0,0.4)" : undefined,
      }}
    >
      <div
        className="bento-glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(220,38,38,0.06), transparent 40%)",
          ["--mx" as string]: `${(tilt.y / 12 + 0.5) * 100}%`,
          ["--my" as string]: `${(0.5 - tilt.x / 12) * 100}%`,
        }}
      />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4 sm:mb-5 group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all duration-300 group-hover:scale-110">
          {f.icon}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 group-hover:text-red-300 transition-colors duration-300">{f.title}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">{f.desc}</p>
      </div>
    </div>
  )
}

export default function LandingClient() {
  useScrollReveal()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 50)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <Preloader />
      <style>{`
        header.scrolled { background: rgba(10,10,11,0.97) !important; box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(220,38,38,0.05); backdrop-filter: blur(20px) !important; }
        .split-char { display: inline-block; transition: color 0.2s, transform 0.3s cubic-bezier(0.33,1,0.68,1); }
        .split-text:hover .split-char { color: #DC2626; }
        .split-text:hover .split-char:hover { color: #EF4444; transform: translateY(-3px) scale(1.1); }
        @media(max-width:640px) {
          .mobile-sticky-cta { position:fixed;bottom:0;left:0;right:0;z-index:50;padding:12px 16px;background:rgba(10,10,11,0.95);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,0.06);transform:translateY(0);transition:transform .3s }
          .mobile-sticky-cta.hidden-scroll { transform:translateY(100%) }
        }
        @media(min-width:641px) { .mobile-sticky-cta { display:none } }
      `}</style>

      {/* Navbar */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/[0.06] h-[80px] sm:h-[80px] px-4 sm:px-6 flex items-center justify-between overflow-hidden">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-white relative z-[1]">
          <div className="relative w-[44px] h-[44px] sm:w-[64px] sm:h-[64px]">
            <img src="/smkn_logo.png" alt="SMKN" className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.3))" }} />
          </div>
          <div className="relative w-[44px] h-[44px] sm:w-[64px] sm:h-[64px]">
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.3))" }} />
          </div>
          <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "16px", fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PARSTAMA
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8 relative z-[1]">
          <a href="#tentang" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Tentang" />
          </a>
          <a href="#syarat" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Syarat" />
          </a>
          <a href="#timeline" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Timeline" />
          </a>
          <Link href="/blog" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Blog" />
          </Link>
          <Link href="/events" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Event" />
          </Link>
          <Link href="/cek-status" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            Tanya AI
          </Link>
          <Link href="/login" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full">
            <SplitText text="Login" />
          </Link>
          <a href="https://wa.me/6281459145800?text=Halo%20PARSTAMA,%20saya%20ingin%20bertanya%20tentang%20pendaftaran." target="_blank" rel="noopener" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            <SplitText text="WhatsApp" />
          </a>
          <RocketButton href="/daftar" className="inline-flex items-center px-6 py-2.5 bg-[#DC2626] text-white rounded-full text-sm font-semibold hover:bg-[#EF4444] hover:-translate-y-0.5 transition-all">
            Daftar Sekarang
          </RocketButton>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 pt-[100px] sm:pt-[120px] pb-16 sm:pb-20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6">
            PMR SMKN 1 Singosari
          </div>
          <h1 className="text-[clamp(1.8rem,5vw,4rem)] sm:text-[clamp(2rem,6vw,4.5rem)] font-display font-extrabold leading-[1.1] text-white mb-4 sm:mb-5 tracking-tight">
            <span className="split-text inline-block cursor-default"><SplitText text="Bergabunglah" /></span>{" "}
            <span className="split-text inline-block cursor-default"><SplitText text="Bersama" /></span>{" "}
            <span className="inline-block bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent whitespace-nowrap">
              PARSTAMA
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Jadilah bagian dari generasi penolong yang hebat. Pelajari keterampilan pertolongan pertama, kembangkan jiwa kepedulian, dan beri dampak nyata bagi masyarakat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <RocketButton href="/daftar" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all min-h-[44px]">
              Isi Form Pendaftaran
            </RocketButton>
            <Link href="/cek-status" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all min-h-[44px]">
              Tanya AI Assistant
            </Link>
            <Link href="/struktur-organisasi" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all min-h-[44px]">
              Struktur Organisasi
            </Link>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" />

      {/* Stats */}
      <section className="flex justify-center gap-6 sm:gap-16 px-4 sm:px-6 py-10 sm:py-12 flex-wrap">
        {[
          { value: "100+", label: "Anggota Aktif", color: "from-red-400 to-red-600" },
          { value: "50+", label: "Kegiatan Sosial", color: "from-amber-400 to-amber-600" },
          { value: "10+", label: "Tahun Berdiri", color: "from-red-400 to-red-600" },
          { value: "30+", label: "Penghargaan", color: "from-amber-400 to-amber-600" },
        ].map((s) => (
          <div key={s.label} className="reveal-scale text-center">
            <div className={`text-3xl sm:text-5xl font-display font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent leading-none mb-1.5 sm:mb-2`}>
              {s.value}
            </div>
            <div className="text-xs sm:text-sm text-zinc-500 font-medium">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" />

      {/* Features */}
      <section id="tentang" className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="reveal text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold text-white mb-3 sm:mb-4">Mengapa <span className="bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent">PARSTAMA</span>?</h2>
          <p className="reveal text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">Kami bukan sekadar organisasi — kami adalah keluarga yang saling mendukung.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: "🎯", title: "Pelatihan Profesional", desc: "Program latihan terstruktur mencakup PPGD, triage, evakuasi, dan manajemen bencana dari pelatih bersertifikat PMI." },
            { icon: "🤝", title: "Komunitas yang Solid", desc: "100+ anggota aktif yang berdedikasi, saling mendukung, dan tumbuh bersama dalam kegiatan kemanusiaan." },
            { icon: "🏆", title: "Prestasi Membanggakan", desc: "Raih pengalaman dan sertifikat bergengsi lewat kompetisi PMR tingkat kecamatan, kota, hingga nasional." },
            { icon: "🌍", title: "Dampak Nyata", desc: "Terlibat langsung dalam kegiatan donor darah, posko kesehatan, dan misi kemanusiaan di lapangan." },
            { icon: "📚", title: "Pengembangan Diri", desc: "Tingkatkan jiwa kepemimpinan, komunikasi, dan kerja tim melalui program pelatihan rutin dan seminar." },
            { icon: "🎖️", title: "Sertifikasi Resmi", desc: "Dapatkan sertifikat resmi dari PMI yang diakui secara nasional sebagai bukti kompetensi Anda." },
          ].map((f) => (
            <BentoCard key={f.title} f={f} />
          ))}
        </div>
      </section>

      {/* Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" />

      {/* Requirements + Timeline */}
      <section id="syarat" className="bg-[#141415] px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-16">
          <div>
            <h2 className="reveal-left text-[clamp(1.3rem,3vw,2rem)] font-display font-extrabold text-white mb-1">Persyaratan Pendaftaran</h2>
            <p className="reveal-left text-sm text-zinc-400 mb-6">Pastikan kamu memenuhi semua persyaratan berikut</p>
            <ul className="space-y-3">
              {[
                "Merupakan siswa aktif SMKN 1 SINGOSARI",
                "Memiliki semangat kepedulian dan jiwa sukarela",
                "Bersedia mengikuti seluruh rangkaian seleksi",
                "Mendapat izin dari orang tua / wali",
                "Mengetahui dan memiliki minat serta tujuan",
              ].map((req) => (
                <li key={req} className="reveal-left flex items-start gap-3 text-sm sm:text-base text-zinc-400 rounded-lg px-2 py-3">
                  <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
            <RocketButton href="/daftar" className="reveal-left inline-flex items-center justify-center mt-6 sm:mt-8 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 transition-all">
              Daftar Sekarang →
            </RocketButton>
          </div>
          <div id="timeline">
            <h2 className="reveal-right text-[clamp(1.3rem,3vw,2rem)] font-display font-extrabold text-white mb-1">Timeline Seleksi</h2>
            <p className="reveal-right text-sm text-zinc-400 mb-6">Ikuti setiap tahapan seleksi dengan baik</p>
            <div className="relative pl-7 sm:pl-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-red-600 before:to-transparent">
              {[
                { title: "Pendaftaran Online", desc: "Isi formulir pendaftaran melalui website ini." },
                { title: "Seleksi Administrasi", desc: "Tim panitia memeriksa berkas pendaftar." },
                { title: "Wawancara & Tes", desc: "Tes tertulis, fisik, dan wawancara motivasi." },
                { title: "Pengumuman Hasil", desc: "Hasil seleksi diumumkan melalui website dan medsos PARSTAMA." },
              ].map((t, i) => (
                <div key={i} className="reveal-right relative mb-6 sm:mb-8 last:mb-0">
                  <div className="absolute left-[-2rem] sm:left-[-2.25rem] top-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-[#141415]" />
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">{t.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" />

      {/* CTA */}
      <section className="px-6 py-16 sm:py-24 text-center">
        <div className="reveal-scale max-w-2xl mx-auto bg-gradient-to-br from-red-600/10 to-red-800/5 border border-red-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-16 relative overflow-hidden">
          <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold text-white mb-2 sm:mb-3">
            <span className="split-text inline-block cursor-default">
              <SplitText text="Siap Bergabung?" />
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8 max-w-md mx-auto">Jangan lewatkan kesempatan menjadi bagian dari keluarga PARSTAMA. Pendaftaran dibuka terbatas!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <RocketButton href="/daftar" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
              Daftar Sekarang — Gratis
            </RocketButton>
            <Link href="/cek-status" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all">
              Tanya AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-[#141415] border-t border-white/[0.06] px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="footer-col">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-4 no-underline">
              <div className="relative w-[44px] h-[44px] sm:w-[64px] sm:h-[64px]">
                <img src="/smkn_logo.png" alt="SMKN" className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.3))" }} />
              </div>
              <div className="relative w-[44px] h-[44px] sm:w-[64px] sm:h-[64px]">
                <img src="/parstama_logo.png" alt="PARSTAMA" className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.3))" }} />
              </div>
              <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "16px", fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                PARSTAMA
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">Palang Merah Remaja atau PARSTAMA adalah organisasi kepemudaan yang berfokus pada kemanusiaan, pertolongan pertama, dan pengembangan karakter siswa.</p>
            <div className="flex gap-3 mt-5">
              {[
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { label: "TikTok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" },
                { label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map((s) => (
                <a key={s.label} href="#" className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/5 hover:border-red-500/30 transition-all" aria-label={s.label}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717A">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4 font-display">Tautan</h4>
            <div className="space-y-2">
              {[
                { label: "Tentang", href: "#tentang" },
                { label: "Persyaratan", href: "#syarat" },
                { label: "Timeline", href: "#timeline" },
                { label: "Daftar", href: "/daftar" },
                { label: "Blog", href: "/blog" },
                { label: "Event", href: "/events" },
                { label: "Tanya AI", href: "/cek-status" },
                { label: "Struktur Organisasi", href: "/struktur-organisasi" },
                { label: "Login Admin", href: "/login" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="block text-xs sm:text-sm text-zinc-400 hover:text-red-400 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4 font-display">Kontak</h4>
            <div className="space-y-3 text-xs sm:text-sm text-zinc-400">
              <p className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                SMKN 1 Singosari, Malang
              </p>
              <p className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                pmr.parstama@gmail.com
              </p>
              <a href="https://wa.me/6281459145800" target="_blank" rel="noopener" className="flex items-center gap-2 text-[#25D366] hover:brightness-110 transition-all mt-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                +62 819-3278-1179
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-zinc-600 pt-6 sm:pt-8 border-t border-white/[0.06]">
          &copy; {new Date().getFullYear()} <span className="text-red-400 font-semibold">PARSTAMA</span> — SMKN 1 Singosari
          <p className="mt-2 text-zinc-500">Made with ❤️ by tim PARSTAMA</p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="mobile-sticky-cta">
        <RocketButton href="/daftar" className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 min-h-[44px]">
          Daftar Sekarang
        </RocketButton>
      </div>

      {/* Fluid Menu (Mobile) */}
      <FluidMenu />
    </>
  )
}
