"use client"

import { useEffect, useState } from "react"

export default function Preloader() {
  const [percent, setPercent] = useState(0)
  const [phase, setPhase] = useState<"loading" | "curtain" | "done">("loading")

  useEffect(() => {
    let frame: number
    let start: number | null = null
    const duration = 2000

    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setPercent(Math.round(eased * 100))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        setTimeout(() => setPhase("curtain"), 200)
        setTimeout(() => setPhase("done"), 1200)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  if (phase === "done") return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0B] flex items-center justify-center overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col items-center gap-8" style={{ opacity: phase === "curtain" ? 0 : 1, transform: phase === "curtain" ? "scale(0.9)" : "scale(1)", transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {/* Logos */}
        <div className="relative flex items-center justify-center gap-4">
          <div className="relative" style={{ opacity: 0, animation: "logoRevealLeft 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards" }}>
            <div className="absolute inset-[-8px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)", animation: "glowPulse 2s ease-in-out infinite" }} />
            <img src="/smkn_logo.png" alt="SMKN" className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(220,38,38,0.3))" }} />
          </div>
          <div className="relative" style={{ opacity: 0, animation: "logoRevealRight 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards" }}>
            <div className="absolute inset-[-8px] rounded-full" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)", animation: "glowPulse 2s ease-in-out infinite 0.5s" }} />
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(220,38,38,0.3))" }} />
          </div>
        </div>

        {/* Brand Name */}
        <div className="overflow-hidden" style={{ opacity: 0, animation: "textReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards" }}>
          <span className="font-display text-lg sm:text-xl tracking-[0.3em] uppercase" style={{ fontFamily: "Sansita, Georgia, serif", background: "linear-gradient(90deg,#EF4444,#DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PARSTAMA
          </span>
        </div>

        {/* Counter */}
        <div className="font-mono text-xs text-red-500/60 tracking-widest" style={{ opacity: 0, animation: "textReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards" }}>
          {percent}%
        </div>

        {/* Loading Bar */}
        <div className="w-[120px] h-[1px] bg-white/5 rounded-full overflow-hidden" style={{ opacity: 0, animation: "textReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards" }}>
          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${percent}%`, transition: "width 0.1s linear" }} />
        </div>
      </div>

      {/* Curtain */}
      <div className="fixed inset-0 z-[10000] pointer-events-none" style={{ opacity: phase === "curtain" ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-[#0A0A0B]" style={{ transform: phase === "curtain" ? "translateY(-100%)" : "translateY(0)", transition: "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1) 0.1s" }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0A0A0B]" style={{ transform: phase === "curtain" ? "translateY(100%)" : "translateY(0)", transition: "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1) 0.1s" }} />
      </div>

      <style>{`
        @keyframes logoRevealLeft {
          from { opacity: 0; transform: perspective(800px) rotateY(-40deg) rotateX(10deg) translateX(-30px) scale(0.7); filter: blur(8px); }
          to { opacity: 1; transform: perspective(800px) rotateY(0deg) rotateX(0deg) translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes logoRevealRight {
          from { opacity: 0; transform: perspective(800px) rotateY(40deg) rotateX(10deg) translateX(30px) scale(0.7); filter: blur(8px); }
          to { opacity: 1; transform: perspective(800px) rotateY(0deg) rotateX(0deg) translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
      `}</style>
    </div>
  )
}
