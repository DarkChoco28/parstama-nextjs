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
        setTimeout(() => setPhase("curtain"), 150)
        setTimeout(() => setPhase("done"), 900)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  if (phase === "done") return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        zIndex: 99999,
        background: "#0A0A0B",
        opacity: phase === "curtain" ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: phase === "curtain" ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center gap-4">
          <div className="relative" style={{ opacity: 0, animation: "logoRevealLeft 1s cubic-bezier(0.16,1,0.3,1) 0.2s forwards" }}>
            <div className="absolute inset-[-8px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,122,26,0.2) 0%, transparent 70%)", animation: "glowPulse 2s ease-in-out infinite" }} />
            <img src="/smkn_logo.png" alt="SMKN" className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(232,122,26,0.3))" }} />
          </div>
          <div className="relative" style={{ opacity: 0, animation: "logoRevealRight 1s cubic-bezier(0.16,1,0.3,1) 0.4s forwards" }}>
            <div className="absolute inset-[-8px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,122,26,0.2) 0%, transparent 70%)", animation: "glowPulse 2s ease-in-out infinite 0.5s" }} />
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(232,122,26,0.3))" }} />
          </div>
        </div>

        <div className="overflow-hidden" style={{ opacity: 0, animation: "textReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s forwards" }}>
          <span className="text-lg sm:text-xl tracking-[0.3em] uppercase" style={{ fontFamily: "Sansita, Georgia, serif", background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PARSTAMA
          </span>
        </div>

        <div className="text-xs tracking-widest" style={{ color: "rgba(232,122,26,0.5)", fontFamily: "monospace", opacity: 0, animation: "textReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s forwards" }}>
          {percent}%
        </div>

        <div className="w-[120px] h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", opacity: 0, animation: "textReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s forwards" }}>
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg, #E87A1A, #F97316)", transition: "width 0.1s linear" }} />
        </div>
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
