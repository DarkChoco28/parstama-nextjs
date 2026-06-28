"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import FluidMenu from "./FluidMenu"
import Preloader from "./Preloader"

const Hero3D = dynamic(() => import("@/components/landing/Hero3D"), { ssr: false })

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

export default function LandingClient() {
  useScrollReveal()
  const glowRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    const onMove = (e: MouseEvent) => {
      glow.style.left = e.clientX + "px"
      glow.style.top = e.clientY + "px"
    }
    document.addEventListener("mousemove", onMove, { passive: true })
    return () => document.removeEventListener("mousemove", onMove)
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
        header.scrolled { background: rgba(10,10,11,0.97) !important; box-shadow: 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(220,38,38,0.05); backdrop-filter: blur(20px) !important; }
        header::after { content: ''; position: absolute; top: 0; left: -100%; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent); animation: scanLine 5s linear infinite; pointer-events: none; }
        @keyframes scanLine { from { left: -100%; } to { left: 200%; } }
        @keyframes neonPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes shimmerStat { 0% { left: -100%; } 50%,100% { left: 200%; } }
      `}</style>

      {/* Cursor Glow */}
      <div ref={glowRef} id="cursor-glow" style={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%, -50%)" }} />

      {/* Background: Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ filter: "blur(80px)" }}>
          <div className="absolute w-[600px] h-[600px] -top-[100px] -left-[100px] opacity-30" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 70%)", animation: "meshFloat1 20s ease-in-out infinite" }} />
          <div className="absolute w-[500px] h-[500px] top-[15%] right-[-80px] opacity-25" style={{ background: "radial-gradient(circle, rgba(153,27,27,0.3) 0%, transparent 70%)", animation: "meshFloat2 25s ease-in-out infinite 3s" }} />
          <div className="absolute w-[450px] h-[450px] bottom-[5%] left-[25%] opacity-20" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)", animation: "meshFloat3 18s ease-in-out infinite 6s" }} />
          <div className="absolute w-[350px] h-[350px] top-[45%] left-[10%] opacity-15" style={{ background: "radial-gradient(circle, rgba(185,28,28,0.2) 0%, transparent 70%)", animation: "meshFloat4 22s ease-in-out infinite 9s" }} />
        </div>

        {/* Grain Texture */}
        <svg className="hidden"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter></svg>
        <div className="absolute inset-0 opacity-[0.03]" style={{ filter: "url(#grain)" }} />

        {/* Floating Cross Particles */}
        {[
          { x: "15%", y: "20%", size: 5, dur: 16, delay: 0 },
          { x: "80%", y: "12%", size: 4, dur: 20, delay: 2 },
          { x: "60%", y: "70%", size: 6, dur: 18, delay: 4 },
          { x: "25%", y: "85%", size: 4, dur: 22, delay: 6 },
          { x: "90%", y: "50%", size: 5, dur: 17, delay: 1 },
          { x: "45%", y: "35%", size: 3, dur: 24, delay: 3 },
        ].map((p, i) => (
          <div key={i} className="absolute opacity-[0.07]" style={{ left: p.x, top: p.y, width: p.size, height: p.size, animation: `crossDrift${i % 3 + 1} ${p.dur}s ease-in-out infinite ${p.delay}s` }}>
            <svg viewBox="0 0 24 24" fill="rgba(220,38,38,0.8)" width="100%" height="100%"><rect x="9" y="4" width="6" height="16" rx="1" /><rect x="4" y="9" width="16" height="6" rx="1" /></svg>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes meshFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,40px) scale(1.1); } 66% { transform: translate(-30px,80px) scale(0.95); } }
        @keyframes meshFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-60px) scale(1.15); } }
        @keyframes meshFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(40px,-30px) scale(1.1); } 70% { transform: translate(-60px,20px) scale(0.9); } }
        @keyframes meshFloat4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,50px) scale(1.2); } }
        @keyframes crossDrift1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(20px,-30px) rotate(180deg); } }
        @keyframes crossDrift2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-15px,25px) rotate(-180deg); } }
        @keyframes crossDrift3 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(25px,15px) rotate(90deg); } }
      `}</style>

      {/* Navbar */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/[0.06] h-[100px] px-6 flex items-center justify-between overflow-hidden" style={{ animation: "navbarSlideDown 0.6s ease-out" }}>
        {/* 3D Floating Red Crosses */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[600px] z-0">
          <div className="absolute w-[14px] h-[14px] opacity-[0.15] top-1/2 left-[20%]" style={{ animation: "navCrossFloat1 8s ease-in-out infinite" }}>
            <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
          </div>
          <div className="absolute w-[14px] h-[14px] opacity-[0.15] top-[30%] left-[45%]" style={{ animation: "navCrossFloat2 10s ease-in-out infinite 1s" }}>
            <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
          </div>
          <div className="absolute w-[14px] h-[14px] opacity-[0.15] top-[60%] left-[70%]" style={{ animation: "navCrossFloat1 9s ease-in-out infinite 2s" }}>
            <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
          </div>
          <div className="absolute w-[14px] h-[14px] opacity-[0.15] top-[40%] left-[85%]" style={{ animation: "navCrossFloat2 11s ease-in-out infinite 0.5s" }}>
            <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
          </div>
        </div>

        <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-white relative z-[1]">
          <div className="relative w-[56px] h-[56px] sm:w-[80px] sm:h-[80px]" style={{ transformStyle: "preserve-3d", perspective: "400px" }}>
            <div className="absolute inset-[-6px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,.15) 0%, transparent 70%)", animation: "navGlowPulse 3s ease-in-out infinite" }} />
            <img src="/smkn_logo.png" alt="SMKN" className="w-full h-full object-contain rounded-lg" style={{ animation: "navLogoFloat3D 6s ease-in-out infinite", filter: "drop-shadow(0 0 8px rgba(220,38,38,.4))" }} />
          </div>
          <div className="relative w-[56px] h-[56px] sm:w-[80px] sm:h-[80px]" style={{ transformStyle: "preserve-3d", perspective: "400px" }}>
            <div className="absolute inset-[-6px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,.15) 0%, transparent 70%)", animation: "navGlowPulse 3s ease-in-out infinite 0.5s" }} />
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-full h-full object-contain rounded-lg" style={{ animation: "navLogoFloat3D 6s ease-in-out infinite 0.5s", filter: "drop-shadow(0 0 8px rgba(220,38,38,.4))" }} />
          </div>
          <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "18px", fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PARSTAMA
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8 relative z-[1]">
          <a href="#tentang" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full" style={{ animation: "navLinkFadeIn 0.6s ease-out backwards 0.1s" }}>
            Tentang
          </a>
          <a href="#syarat" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full" style={{ animation: "navLinkFadeIn 0.6s ease-out backwards 0.2s" }}>
            Syarat
          </a>
          <a href="#timeline" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full" style={{ animation: "navLinkFadeIn 0.6s ease-out backwards 0.3s" }}>
            Timeline
          </a>
          <Link href="/cek-status" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full" style={{ animation: "navLinkFadeIn 0.6s ease-out backwards 0.4s" }}>
            💬 Tanya AI
          </Link>
          <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-red-400 after:to-red-600 after:transition-all hover:after:w-full" style={{ animation: "navLinkFadeIn 0.6s ease-out backwards 0.5s" }}>
            Login
          </Link>
          <a href="https://wa.me/6281459145800?text=Halo%20PARSTAMA,%20saya%20ingin%20bertanya%20tentang%20pendaftaran." target="_blank" rel="noopener" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            WhatsApp
          </a>
          <Link href="/daftar" className="inline-flex items-center px-6 py-2.5 bg-[#DC2626] text-white rounded-full text-sm font-semibold hover:bg-[#EF4444] hover:-translate-y-0.5 transition-all">
            Daftar Sekarang
          </Link>
        </nav>
      </header>
      <style>{`
        @keyframes navCrossFloat1 { 0%,100% { transform: perspective(400px) rotateY(0deg) rotateX(0deg) translateY(0px); } 50% { transform: perspective(400px) rotateY(180deg) rotateX(20deg) translateY(-8px); } }
        @keyframes navCrossFloat2 { 0%,100% { transform: perspective(400px) rotateY(180deg) rotateX(-15deg) translateY(0px); } 50% { transform: perspective(400px) rotateY(360deg) rotateX(15deg) translateY(-6px); } }
      `}</style>
      <style>{`
        @keyframes navbarSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes navLinkFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes navLogoFloat3D { 0%,100% { transform: perspective(400px) rotateY(-12deg) rotateX(5deg) translateY(0px); } 25% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); } 50% { transform: perspective(400px) rotateY(12deg) rotateX(5deg) translateY(0px); } 75% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); } }
      `}</style>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-24 pb-16 sm:pt-[120px] sm:pb-20 overflow-hidden">
        <Hero3D />

        {/* 3D Grid */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(220,38,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", transform: "perspective(600px) rotateX(40deg) translateY(20%) scaleY(2)", transformOrigin: "center bottom", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, transparent 100%)", animation: "gridPulse 4s ease-in-out infinite" }} />

        <style>{`
          @keyframes gridPulse {
            0%, 100% { opacity: 0.5; background-size: 60px 60px; }
            50% { opacity: 1; background-size: 62px 62px; }
          }
        `}</style>

        {/* Floating Orbs */}
        <div className="absolute w-[300px] h-[300px] top-[10%] -right-[80px] rounded-full pointer-events-none z-[1]" style={{ background: "radial-gradient(circle at 40% 40%, rgba(220,38,38,0.15), transparent 70%)", border: "1px solid rgba(220,38,38,0.08)", animation: "orbFloat1 8s ease-in-out infinite" }} />
        <div className="absolute w-[180px] h-[180px] bottom-[15%] -left-[50px] rounded-full pointer-events-none z-[1]" style={{ background: "radial-gradient(circle at 60% 60%, rgba(239,68,68,0.12), transparent 70%)", border: "1px solid rgba(239,68,68,0.06)", animation: "orbFloat2 6s ease-in-out infinite 1s" }} />
        <div className="absolute w-[100px] h-[100px] top-[35%] left-[10%] rounded-full pointer-events-none z-[1]" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.1), transparent 70%)", border: "1px solid rgba(220,38,38,0.1)", animation: "orbFloat3 10s ease-in-out infinite 2s" }} />

        {/* Expanding Rings */}
        <div className="absolute w-[600px] h-[600px] rounded-full border border-red-500/10 top-1/2 left-1/2 pointer-events-none z-[1]" style={{ transform: "translate(-50%,-50%) rotateX(70deg)", animation: "heroRingExpand 6s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-red-500/15 top-1/2 left-1/2 pointer-events-none z-[1]" style={{ transform: "translate(-50%,-50%) rotateX(70deg)", animation: "heroRingExpand 6s ease-in-out infinite 2s" }} />

        <style>{`
          @keyframes orbFloat1 { 0%,100% { transform: perspective(800px) rotateX(10deg) rotateY(-15deg) translateY(0px); } 50% { transform: perspective(800px) rotateX(-10deg) rotateY(15deg) translateY(-30px); } }
          @keyframes orbFloat2 { 0%,100% { transform: perspective(600px) rotateX(-8deg) rotateY(12deg) translateY(0px) scale(1); } 50% { transform: perspective(600px) rotateX(8deg) rotateY(-12deg) translateY(-20px) scale(1.1); } }
          @keyframes orbFloat3 { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.6; } 33% { transform: translateY(-15px) rotate(120deg); opacity: 1; } 66% { transform: translateY(-8px) rotate(240deg); opacity: 0.8; } }
          @keyframes heroRingExpand { 0%,100% { transform: translate(-50%,-50%) rotateX(70deg) scale(1); opacity: 0.5; } 50% { transform: translate(-50%,-50%) rotateX(70deg) scale(1.08); opacity: 1; } }
        `}</style>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="reveal inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6">
            PMR SMKN 1 Singosari
          </div>
          <h1 className="reveal text-[clamp(2rem,6vw,4.5rem)] font-display font-extrabold leading-[1.1] text-white mb-4 sm:mb-5 tracking-tight">
            Bergabunglah Bersama{" "}
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent whitespace-nowrap">
              PARSTAMA
            </span>
          </h1>
          <p className="reveal text-sm sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Jadilah bagian dari generasi penolong yang hebat. Pelajari keterampilan pertolongan pertama, kembangkan jiwa kepedulian, dan beri dampak nyata bagi masyarakat.
          </p>
          <div className="reveal flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/daftar" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
              Isi Form Pendaftaran
            </Link>
            <Link href="/cek-status" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all">
              💬 Tanya AI Assistant
            </Link>
            <Link href="/struktur-organisasi" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all">
              📋 Struktur Organisasi
            </Link>
          </div>
        </div>
      </section>

      {/* Neon Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" style={{ animation: "neonPulse 3s ease-in-out infinite" }} />

      {/* Stats */}
      <section className="flex justify-center gap-8 sm:gap-16 px-6 py-10 sm:py-12 flex-wrap">
        {[
          { value: "100+", label: "Anggota Aktif" },
          { value: "50+", label: "Kegiatan Sosial" },
          { value: "10+", label: "Tahun Berdiri" },
          { value: "30+", label: "Penghargaan" },
        ].map((s, i) => (
          <div key={s.label} className="reveal-scale text-center group perspective-[1000px]" style={{ animationDelay: `${0.2 + i * 0.2}s`, transitionDelay: `${0.2 + i * 0.2}s` }}>
            <div className="text-3xl sm:text-5xl font-display font-extrabold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent leading-none mb-1.5 sm:mb-2 relative overflow-hidden group-hover:animate-[statFlip_0.6s_ease-in-out_forwards]">
              {s.value}
              <span className="absolute top-0 left-[-100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: "shimmerStat 3s ease-in-out infinite" }} />
            </div>
            <div className="text-xs sm:text-sm text-zinc-500 font-medium">{s.label}</div>
          </div>
        ))}
      </section>
      <style>{`
        @keyframes statFlip { 0% { transform: rotateY(0deg) rotateX(0deg) scale(1); } 50% { transform: rotateY(180deg) rotateX(10deg) scale(1.1); } 100% { transform: rotateY(360deg) rotateX(0deg) scale(1); } }
      `}</style>

      {/* Neon Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" style={{ animation: "neonPulse 3s ease-in-out infinite" }} />

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
          ].map((f, i) => (
            <div key={f.title} className="reveal-scale group bg-[#1A1A1C] border border-white/[0.06] rounded-2xl p-6 sm:p-8 transition-all duration-[400ms] perspective-[1000px]" style={{ transformStyle: "preserve-3d", transitionDelay: `${0.1 + i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4 sm:mb-5 group-hover:animate-[emoji3DRotate_0.6s_ease-in-out_forwards]">
                {f.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <style>{`
        @keyframes emoji3DRotate { 0% { transform: perspective(600px) rotateY(0deg) rotateX(0deg) scale(1); } 50% { transform: perspective(600px) rotateY(180deg) rotateX(20deg) scale(1.2); } 100% { transform: perspective(600px) rotateY(360deg) rotateX(0deg) scale(1); } }
      `}</style>

      {/* Neon Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" style={{ animation: "neonPulse 3s ease-in-out infinite" }} />

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
                <li key={req} className="reveal-left flex items-start gap-3 text-sm sm:text-base text-zinc-400 rounded-lg px-2 py-3 transition-all duration-300 hover:bg-red-500/5 hover:translate-x-2 hover:perspective-[400px] hover:rotateY-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
            <Link href="/daftar" className="reveal-left inline-flex items-center justify-center mt-6 sm:mt-8 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-800 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 transition-all">
              Daftar Sekarang →
            </Link>
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
                <div key={i} className="reveal-right relative mb-6 sm:mb-8 last:mb-0 group" style={{ transitionDelay: `${0.1 + i * 0.15}s` }}>
                  <div className="absolute left-[-2rem] sm:left-[-2.25rem] top-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-[#141415] transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_0_8px_rgba(220,38,38,0.3)]" style={{ animation: "timelineDotPulse 2s ease-in-out infinite", animationDelay: `${i * 0.5}s` }} />
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">{t.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes timelineDotPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0.1); } }
        .hover\\:perspective-\\[400px\\]:hover { perspective: 400px; }
        .hover\\:rotateY-2:hover { transform: perspective(400px) translateX(8px) rotateY(-2deg); }
      `}</style>

      {/* Neon Separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent mx-6" style={{ animation: "neonPulse 3s ease-in-out infinite" }} />

      {/* CTA */}
      <section className="px-6 py-16 sm:py-24 text-center">
        <div className="reveal-scale max-w-2xl mx-auto bg-gradient-to-br from-red-600/10 to-red-800/5 border border-red-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-16 relative overflow-hidden perspective-[1000px] group">
          <div className="absolute inset-[-2px] rounded-[inherit] z-[-1]" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(220,38,38,0.3) 25%, transparent 50%, rgba(220,38,38,0.3) 75%, transparent 100%)", animation: "rotateBorder 4s linear infinite" }} />
          <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold text-white mb-2 sm:mb-3">Siap Bergabung?</h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8 max-w-md mx-auto">Jangan lewatkan kesempatan menjadi bagian dari keluarga PARSTAMA. Pendaftaran dibuka terbatas!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/daftar" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all">
              Daftar Sekarang — Gratis
            </Link>
            <Link href="/cek-status" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-zinc-300 border border-white/20 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all">
              💬 Tanya AI
            </Link>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes rotateBorder { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Footer */}
      <footer id="kontak" className="bg-[#141415] border-t border-white/[0.06] px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="footer-col">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-4 no-underline">
              <div className="relative w-[56px] h-[56px] sm:w-[80px] sm:h-[80px]" style={{ transformStyle: "preserve-3d", perspective: "400px" }}>
                <div className="absolute inset-[-6px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,.15) 0%, transparent 70%)", animation: "navGlowPulse 3s ease-in-out infinite" }} />
                <img src="/smkn_logo.png" alt="SMKN" className="w-full h-full object-contain rounded-lg" style={{ animation: "navLogoFloat3D 6s ease-in-out infinite", filter: "drop-shadow(0 0 8px rgba(220,38,38,.4))" }} />
              </div>
              <div className="relative w-[56px] h-[56px] sm:w-[80px] sm:h-[80px]" style={{ transformStyle: "preserve-3d", perspective: "400px" }}>
                <div className="absolute inset-[-6px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,.15) 0%, transparent 70%)", animation: "navGlowPulse 3s ease-in-out infinite 0.5s" }} />
                <img src="/parstama_logo.png" alt="PARSTAMA" className="w-full h-full object-contain rounded-lg" style={{ animation: "navLogoFloat3D 6s ease-in-out infinite 0.5s", filter: "drop-shadow(0 0 8px rgba(220,38,38,.4))" }} />
              </div>
              <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "18px", fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
                { label: "💬 Tanya AI", href: "/cek-status" },
                { label: "📋 Struktur Organisasi", href: "/struktur-organisasi" },
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

      {/* Fluid Menu (Mobile) */}
      <FluidMenu />
    </>
  )
}
