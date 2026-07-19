"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import LogoLoop from "../ui/LogoLoop"
import ShapeGrid from "./ShapeGrid"
import FluidMenu from "./FluidMenu"
import Preloader from "./Preloader"
import RocketButton from "./RocketButton"
import GlowingButton from "../ui/GlowingButton"
import Carousel from "../ui/Carousel"

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

export default function LandingClient() {
  useScrollReveal()
  const headerRef = useRef<HTMLElement>(null)
  const [latestArticles, setLatestArticles] = useState<Array<{ id: string; title: string; slug: string; excerpt: string | null; category: string; coverImage: string | null }>>([])

  useEffect(() => {
    fetch("/api/articles?limit=5")
      .then(r => r.json())
      .then(d => setLatestArticles(d.articles || []))
      .catch(() => {})
  }, [])

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
        header.scrolled { background: rgba(10,10,11,0.97) !important; box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,122,26,0.05); backdrop-filter: blur(20px) !important; }
        .split-char { display: inline-block; transition: color 0.2s, transform 0.3s cubic-bezier(0.33,1,0.68,1); }
        .split-text:hover .split-char { color: #E87A1A; }
        .split-text:hover .split-char:hover { color: #F97316; transform: translateY(-3px) scale(1.1); }

        .social-wrapper {
          display: inline-flex;
          list-style: none;
          padding: 0;
          margin: 0;
          justify-content: flex-start;
        }

        .social-wrapper .icon {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 50%;
          margin-right: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          color: #71717A;
          text-decoration: none;
        }

        .social-wrapper .tooltip {
          position: absolute;
          top: 0;
          font-size: 12px;
          font-weight: 500;
          background: #fff;
          color: #fff;
          padding: 5px 8px;
          border-radius: 5px;
          box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          white-space: nowrap;
        }

        .social-wrapper .tooltip::before {
          position: absolute;
          content: "";
          height: 8px;
          width: 8px;
          background: #fff;
          bottom: -3px;
          left: 50%;
          transform: translate(-50%) rotate(45deg);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .social-wrapper .icon:hover .tooltip {
          top: -42px;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .social-wrapper .instagram:hover,
        .social-wrapper .instagram:hover .tooltip,
        .social-wrapper .instagram:hover .tooltip::before {
          background: #e4405f;
          color: #fff;
          border-color: #e4405f;
        }

        .social-wrapper .tiktok:hover,
        .social-wrapper .tiktok:hover .tooltip,
        .social-wrapper .tiktok:hover .tooltip::before {
          background: #010101;
          color: #fff;
          border-color: #010101;
        }

        .social-wrapper .whatsapp:hover,
        .social-wrapper .whatsapp:hover .tooltip,
        .social-wrapper .whatsapp:hover .tooltip::before {
          background: #25D366;
          color: #fff;
          border-color: #25D366;
        }

        .social-wrapper .maps:hover,
        .social-wrapper .maps:hover .tooltip,
        .social-wrapper .maps:hover .tooltip::before {
          background: #4285F4;
          color: #fff;
          border-color: #4285F4;
        }
        
        .social-wrapper .icon:hover {
          color: #fff !important;
        }

        .article-marquee {
          animation: articleScroll 30s linear infinite;
        }
        .article-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes articleScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Navbar */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/6 h-20 sm:h-20 px-4 sm:px-6 flex items-center justify-between overflow-hidden">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-white relative z-1">
          <div className="relative w-15 h-15 sm:w-16 sm:h-16">
            <Image src="/smkn_logo.png" alt="SMKN" width={60} height={60} unoptimized className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(232,122,26,0.3))" }} />
          </div>
          <div className="relative w-15 h-15 sm:w-16 sm:h-16">
            <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} unoptimized className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(232,122,26,0.3))" }} />
          </div>
          <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "16px", fontWeight: 700, background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PARSTAMA
          </span>
        </Link>
        <nav className="flex sm:hidden items-center gap-4 relative z-1">
          <Link href="/faq" className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">FAQ</Link>
          <Link href="/events" className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">Event</Link>
          <Link href="/blog" className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">Blog</Link>
        </nav>
        <nav className="hidden sm:flex items-center gap-8 relative z-1">
          <a href="#tentang" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Tentang" />
          </a>
          <a href="#syarat" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Syarat" />
          </a>
          <a href="#timeline" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Timeline" />
          </a>
          <Link href="/sejarah" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Sejarah" />
          </Link>
          <Link href="/blog" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Blog" />
          </Link>
          <Link href="/events" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Event" />
          </Link>
          <Link href="/faq" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="FAQ" />
          </Link>
          <Link href="/cek-status" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            Tanya AI
          </Link>
          <Link href="/login" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-orange-400 after:to-orange-600 after:transition-all hover:after:w-full">
            <SplitText text="Login" />
          </Link>
          <a href="https://wa.me/6281459145800?text=Halo%20PARSTAMA,%20saya%20ingin%20bertanya%20tentang%20pendaftaran." target="_blank" rel="noopener" className="split-text text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            <SplitText text="WhatsApp" />
          </a>
          <a
            href="/daftar"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#DC2626] text-white rounded-full text-sm font-semibold hover:bg-[#EF4444] hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Isi Form Pendaftaran
          </a>
        </nav>
      </header>

      {/* ShapeGrid Background - full page */}
      <div className="fixed inset-0 opacity-40 sm:opacity-70" style={{ zIndex: 0, pointerEvents: "none" }}>
        <ShapeGrid
          speed={0.3}
          squareSize={40}
          direction="diagonal"
          borderColor="rgba(232,122,26,0.5)"
          hoverFillColor="rgba(232,122,26,0.15)"
          shape="hexagon"
          hoverTrailAmount={7}
        />
      </div>

      {/* Hero */}
      <section className="relative min-h-auto sm:min-h-screen flex items-center justify-center text-center px-4 sm:px-6 pt-28 pb-10 sm:pt-30 sm:pb-20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6">
            PMR SMKN 1 Singosari
          </div>
          <h1 className="text-[clamp(1.8rem,5vw,4rem)] sm:text-[clamp(2rem,6vw,4.5rem)] font-display font-extrabold leading-[1.1] text-white mb-4 sm:mb-5 tracking-tight">
            <span className="split-text inline-block cursor-default"><SplitText text="Bergabunglah" /></span>{" "}
            <span className="split-text inline-block cursor-default"><SplitText text="Bersama" /></span>{" "}
            <span className="inline-block bg-linear-to-r from-orange-400 via-orange-400 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
              PARSTAMA
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Jadilah bagian dari generasi penolong yang hebat. Pelajari keterampilan pertolongan pertama, kembangkan jiwa kepedulian, dan beri dampak nyata bagi masyarakat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <RocketButton href="/daftar" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white bg-linear-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Isi Form Pendaftaran
            </RocketButton>
            <Link href="/cek-status" className="inline-flex justify-center">
              <GlowingButton preset="ember" speed="normal" glowIntensity="medium" shape="pill">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Tanya AI Assistant
              </GlowingButton>
            </Link>
            <Link href="/struktur-organisasi" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Struktur Organisasi
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Marquee */}
      {latestArticles.length > 0 && (
        <div className="mt-10 sm:mt-14 pb-6 sm:pb-8">
          <div className="overflow-hidden">
            <div className="article-marquee flex gap-4 px-4" style={{ width: "max-content" }}>
              {[...latestArticles, ...latestArticles].map((article, i) => (
                <Link
                  key={`${article.id}-${i}`}
                  href={`/blog/${article.slug}`}
                  className="group relative flex-none w-65 sm:w-75 bg-[#141415] border border-white/6 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(232,122,26,0.06)] z-10"
                >
                  {article.coverImage && (
                    <div className="w-full h-28 rounded-lg overflow-hidden mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
                    {article.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1 group-hover:text-orange-300 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-1">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-orange-400 font-medium">Selengkapnya &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/40 to-transparent mx-6" />

      {/* Stats */}
      <section className="flex justify-center gap-6 sm:gap-16 px-4 sm:px-6 py-10 sm:py-12 flex-wrap">
        {[
          { value: "100+", label: "Anggota Aktif", color: "from-orange-400 to-orange-600" },
          { value: "50+", label: "Kegiatan Sosial", color: "from-amber-400 to-amber-600" },
          { value: "10+", label: "Tahun Berdiri", color: "from-orange-400 to-orange-600" },
          { value: "30+", label: "Penghargaan", color: "from-amber-400 to-amber-600" },
        ].map((s) => (
          <div key={s.label} className="reveal-scale text-center">
            <div className={`text-3xl sm:text-5xl font-display font-extrabold bg-linear-to-r ${s.color} bg-clip-text text-transparent leading-none mb-1.5 sm:mb-2`}>
              {s.value}
            </div>
            <div className="text-xs sm:text-sm text-zinc-500 font-medium">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Separator */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/40 to-transparent mx-6" />

      {/* Features */}
      <section id="tentang" className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="reveal text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold text-white mb-3 sm:mb-4">Mengapa <span className="bg-linear-to-r from-orange-400 via-orange-400 to-orange-600 bg-clip-text text-transparent">PARSTAMA</span>?</h2>
          <p className="reveal text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">Kami bukan sekadar organisasi — kami adalah keluarga yang saling mendukung.</p>
        </div>
        <div className="reveal-scale flex justify-center">
          <Carousel
            items={[
              { id: 1, icon: <span className="text-sm">🎯</span>, title: "Pelatihan Profesional", description: "Program latihan terstruktur mencakup PPGD, triage, evakuasi, dan manajemen bencana dari pelatih bersertifikat PMI." },
              { id: 2, icon: <span className="text-sm">🤝</span>, title: "Komunitas yang Solid", description: "100+ anggota aktif yang berdedikasi, saling mendukung, dan tumbuh bersama dalam kegiatan kemanusiaan." },
              { id: 3, icon: <span className="text-sm">🏆</span>, title: "Prestasi Membanggakan", description: "Raih pengalaman dan sertifikat bergengsi lewat kompetisi PMR tingkat kecamatan, kota, hingga nasional." },
              { id: 4, icon: <span className="text-sm">🌍</span>, title: "Dampak Nyata", description: "Terlibat langsung dalam kegiatan donor darah, posko kesehatan, dan misi kemanusiaan di lapangan." },
              { id: 5, icon: <span className="text-sm">📚</span>, title: "Pengembangan Diri", description: "Tingkatkan jiwa kepemimpinan, komunikasi, dan kerja tim melalui program pelatihan rutin dan seminar." },
              { id: 6, icon: <span className="text-sm">🎖️</span>, title: "Sertifikasi Resmi", description: "Dapatkan sertifikat resmi dari PMI yang diakui secara nasional sebagai bukti kompetensi Anda." },
            ]}
            baseWidth={320}
            autoplay
            autoplayDelay={3000}
            pauseOnHover
            loop
          />
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/40 to-transparent mx-6" />

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
                  <span className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
            <Link href="/sejarah" className="reveal-left inline-flex items-center justify-center gap-2 mt-6 sm:mt-8 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Lihat Sejarah PARSTAMA
            </Link>
          </div>
          <div id="timeline">
            <h2 className="reveal-right text-[clamp(1.3rem,3vw,2rem)] font-display font-extrabold text-white mb-1">Timeline Seleksi</h2>
            <p className="reveal-right text-sm text-zinc-400 mb-6">Ikuti setiap tahapan seleksi dengan baik</p>
            <div className="relative pl-7 sm:pl-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-orange-600 before:to-transparent">
              {[
                { title: "Pendaftaran Online", desc: "Isi formulir pendaftaran melalui website ini." },
                { title: "Seleksi", desc: "Proses seleksi oleh tim panitia PARSTAMA." },
                { title: "Pengumuman Hasil", desc: "Hasil seleksi diumumkan melalui website dan medsos PARSTAMA." },
              ].map((t, i) => (
                <div key={i} className="reveal-right relative mb-6 sm:mb-8 last:mb-0">
                  <div className="absolute -left-8 sm:-left-9 top-1 w-3.5 h-3.5 rounded-full bg-orange-600 border-2 border-[#141415]" />
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">{t.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/40 to-transparent mx-6" />

      {/* CTA */}
      <section className="px-6 py-16 sm:py-24 text-center">
        <div className="reveal-scale max-w-2xl mx-auto bg-linear-to-br from-orange-600/10 to-orange-800/5 border border-orange-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-16 relative overflow-hidden">
          <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold text-white mb-2 sm:mb-3">
            <span className="split-text inline-block cursor-default">
              <SplitText text="Siap Bergabung?" />
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8 max-w-md mx-auto">Jangan lewatkan kesempatan menjadi bagian dari keluarga PARSTAMA. Pendaftaran dibuka terbatas!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold text-white bg-linear-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Isi Form Pendaftaran
            </a>
            <Link href="/cek-status" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-orange-500 hover:text-orange-400 hover:-translate-y-0.5 transition-all">
              Tanya AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-[#141415] border-t border-white/6 px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="footer-col">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-4 no-underline">
              <div className="relative w-15 h-15 sm:w-16 sm:h-16">
                <Image src="/smkn_logo.png" alt="SMKN" width={60} height={60} unoptimized className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(232,122,26,0.3))" }} />
              </div>
              <div className="relative w-15 h-15 sm:w-16 sm:h-16">
                <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} unoptimized className="w-full h-full object-contain rounded-lg" style={{ filter: "drop-shadow(0 0 8px rgba(232,122,26,0.3))" }} />
              </div>
              <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "16px", fontWeight: 700, background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                PARSTAMA
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">Palang Merah Remaja atau PARSTAMA adalah organisasi kepemudaan yang berfokus pada kemanusiaan, pertolongan pertama, dan pengembangan karakter siswa.</p>
            <ul className="social-wrapper mt-5">
              {[
                { label: "Instagram", href: "https://www.instagram.com/parstamabeda?igsh=YmM1NW5qcnQwM3h1", className: "instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { label: "TikTok", href: "https://tiktok.com/...", className: "tiktok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z" },
                { label: "WhatsApp", href: "https://wa.me/6281459145800", className: "whatsapp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
                { label: "Maps", href: "https://maps.google.com/?q=SMKN+1+Singosari", className: "maps", path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener" className={`icon ${s.className}`} aria-label={s.label}>
                  <span className="tooltip">{s.label}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </ul>
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
                { label: "FAQ", href: "/faq" },
                { label: "Struktur Organisasi", href: "/struktur-organisasi" },
                { label: "Login Admin", href: "/login" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="block text-xs sm:text-sm text-zinc-400 hover:text-orange-400 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-zinc-600 pt-6 sm:pt-8 border-t border-white/6">
          &copy; {new Date().getFullYear()} <span className="text-orange-400 font-semibold">PARSTAMA</span> — SMKN 1 Singosari
          <p className="mt-2 text-zinc-500">Made with ❤️ by tim PARSTAMA</p>
        </div>

        {/* Built With - Tech Stack Marquee */}
        <div className="mt-8 pt-6 border-t border-white/6">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-zinc-600 mb-4 font-medium">Built with</p>
          <LogoLoop
            logos={[
              { src: "https://cdn.simpleicons.org/nextdotjs/ffffff", alt: "Next.js", title: "Next.js", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/react/61dafb", alt: "React", title: "React", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/typescript/3178c6", alt: "TypeScript", title: "TypeScript", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/vercel/ffffff", alt: "Vercel", title: "Vercel", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/postgresql/4169e1", alt: "PostgreSQL", title: "PostgreSQL", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/prisma/5a67d8", alt: "Prisma", title: "Prisma", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/tailwindcss/06b6d4", alt: "Tailwind CSS", title: "Tailwind CSS", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/resend/ffffff", alt: "Resend", title: "Resend", width: 32, height: 32 },
              { src: "https://cdn.simpleicons.org/nodedotjs/339933", alt: "Node.js", title: "Node.js", width: 32, height: 32 },
            ]}
            speed={40}
            logoHeight={32}
            gap={48}
            pauseOnHover
            fadeOut
            fadeOutColor="#141415"
            className="opacity-60 hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </footer>

      {/* Fluid Menu (Mobile) */}
      <FluidMenu />
    </>
  )
}
