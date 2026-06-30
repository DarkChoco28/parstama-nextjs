"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

export default function BerhasilPage() {
  const confettiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const colors = ["#ef4444", "#f97316", "#fbbf24", "#dc2626", "#ffffff"]
    const container = confettiRef.current
    if (!container) return

    for (let i = 0; i < 24; i++) {
      const dot = document.createElement("div")
      const size = Math.random() * 10 + 5
      const left = Math.random() * 100
      const duration = Math.random() * 6 + 5
      const delay = Math.random() * 4
      dot.style.cssText = `
        position:fixed;pointer-events:none;border-radius:50%;
        width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${left}%;
        animation:confettiFloat ${duration}s linear ${delay}s infinite;
        opacity:0.7;z-index:40;
      `
      container.appendChild(dot)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.3); opacity: 0; }
          70%  { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ripple {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes crossFloat1 {
          0%,100% { transform: perspective(800px) rotateY(0deg) rotateX(10deg) translateZ(0px) translateY(0px); }
          50% { transform: perspective(800px) rotateY(180deg) rotateX(-10deg) translateZ(40px) translateY(-30px); }
        }
        @keyframes crossFloat2 {
          0%,100% { transform: perspective(800px) rotateY(180deg) rotateX(-15deg) translateZ(0px) translateY(0px); }
          50% { transform: perspective(800px) rotateY(360deg) rotateX(15deg) translateZ(50px) translateY(-20px); }
        }
        @keyframes icon3D {
          0%,100% { transform: perspective(600px) rotateY(-15deg) rotateX(5deg); }
          50% { transform: perspective(600px) rotateY(15deg) rotateX(-5deg); }
        }
        @keyframes confettiFloat {
          0%   { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; }
        }
        @keyframes logo3D {
          0%,100% { transform: perspective(400px) rotateY(-12deg) rotateX(5deg) translateY(0px); }
          25% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); }
          50% { transform: perspective(400px) rotateY(12deg) rotateX(5deg) translateY(0px); }
          75% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); }
        }
      `}</style>

      <div className="fixed inset-0 bg-[#0f0f0f]" />

      {/* Background circles */}
      <div className="fixed pointer-events-none rounded-full w-[600px] h-[600px] -top-[100px] -left-[100px]" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)" }} />
      <div className="fixed pointer-events-none rounded-full w-[400px] h-[400px] -bottom-[80px] -right-[80px]" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)" }} />

      {/* Floating 3D Red Cross symbols */}
      <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 40, height: 40, top: "20%", left: "10%", animation: "crossFloat1 12s ease-in-out infinite" }}>
        <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
      </div>
      <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 28, height: 28, top: "60%", left: "85%", animation: "crossFloat2 14s ease-in-out infinite 2s" }}>
        <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
      </div>
      <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 50, height: 50, top: "75%", left: "15%", animation: "crossFloat1 16s ease-in-out infinite 1s" }}>
        <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
      </div>
      <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 22, height: 22, top: "15%", left: "80%", animation: "crossFloat2 10s ease-in-out infinite 0.5s" }}>
        <svg viewBox="0 0 24 24" fill="#DC2626" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
      </div>

      {/* Confetti container */}
      <div ref={confettiRef} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 py-12">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-6 no-underline" style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
          <img src="/parstama_logo.png" alt="PARSTAMA" className="w-[72px] h-[72px] rounded-full object-contain" style={{ animation: "logo3D 6s ease-in-out infinite", boxShadow: "0 0 40px rgba(220,38,38,0.4)" }} />
          <span className="font-bold text-lg bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent" style={{ fontFamily: "Georgia, serif" }}>
            PARSTAMA
          </span>
        </Link>

        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center mb-8" style={{ animation: "floatY 3s ease-in-out infinite, icon3D 8s ease-in-out infinite" }}>
          <div className="absolute inset-0 rounded-full border-2 border-red-500/50" style={{ animation: "ripple 2s ease-out infinite" }} />
          <div className="absolute inset-0 rounded-full border-2 border-red-500/50" style={{ animation: "ripple 2s ease-out 0.6s infinite" }} />
          <div className="absolute inset-0 rounded-full border-2 border-red-500/50" style={{ animation: "ripple 2s ease-out 1.2s infinite" }} />
          <div className="relative z-10 w-24 h-24 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(220,38,38,0.4)]" style={{ animation: "popIn 0.6s 0.2s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
            🩸
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[clamp(1.8rem,5vw,2.8rem)] font-extrabold mb-3 leading-tight" style={{ animation: "fadeUp 0.6s 0.5s ease both" }}>
          Pendaftaran{" "}
          <span className="bg-linear-to-r from-red-400 via-orange-400 to-red-400 bg-[length:200%_auto] bg-clip-text text-transparent" style={{ animation: "gradientShift 3s linear infinite" }}>
            Berhasil!
          </span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed mx-auto mb-8 px-2" style={{ animation: "fadeUp 0.6s 0.65s ease both" }}>
          Terima kasih telah mendaftar sebagai calon anggota <strong className="text-zinc-200">PARSTAMA</strong>.
          Data Anda telah kami terima dan akan segera diproses oleh tim panitia seleksi.
        </p>

        {/* Info Card */}
        <div className="w-full max-w-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 sm:p-6 mb-8 text-left" style={{ animation: "fadeUp 0.6s 0.8s ease both" }}>
          <div className="flex items-start gap-3 py-3 border-b border-white/[0.05]">
            <span className="text-lg flex-shrink-0">📧</span>
            <div>
              <strong className="text-zinc-200 text-xs block mb-0.5">Pantau Informasi Panitia</strong>
              <span className="text-zinc-400 text-sm">Informasi lanjutan dapat disampaikan melalui email atau WhatsApp yang Anda daftarkan.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3 border-b border-white/[0.05]">
            <span className="text-lg flex-shrink-0">📅</span>
            <div>
              <strong className="text-zinc-200 text-xs block mb-0.5">Proses Seleksi</strong>
              <span className="text-zinc-400 text-sm">Pendaftaran Anda akan diperiksa oleh panitia sesuai jadwal seleksi yang sedang berjalan.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3">
            <span className="text-lg flex-shrink-0">📢</span>
            <div>
              <strong className="text-zinc-200 text-xs block mb-0.5">Cek Status</strong>
              <span className="text-zinc-400 text-sm">Gunakan fitur cek status untuk melihat perkembangan pendaftaran Anda kapan saja.</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md" style={{ animation: "fadeUp 0.6s 0.95s ease both" }}>
          <Link
            href="/"
            className="flex-1 px-6 py-3.5 rounded-full text-center font-bold text-sm bg-linear-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            ← Kembali ke Beranda
          </Link>
          <Link
            href="/cek-status"
            className="flex-1 px-6 py-3.5 rounded-full text-center font-semibold text-sm border border-white/20 text-zinc-300 hover:border-red-500 hover:text-red-400 hover:-translate-y-0.5 transition-all duration-200"
          >
            💬 Tanya AI
          </Link>
        </div>
      </div>
    </>
  )
}
