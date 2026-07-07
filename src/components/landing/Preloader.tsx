"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-9999 bg-[#0A0A0B] flex items-center justify-center" style={{ animation: "preloaderFadeOut 0.8s ease-out 2.2s forwards" }}>
      <div className="flex flex-col items-center gap-6" style={{ animation: "preloaderSpin 2s ease-in-out forwards" }}>
        <div className="relative w-55 h-55 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-red-500/25" style={{ animation: "orbitRing 3s linear infinite reverse" }} />
          <div className="relative flex items-center justify-center" style={{ animation: "preloaderLogoFloat 2s ease-in-out infinite" }}>
            <Image src="/parstama_logo.png" alt="PARSTAMA" width={160} height={160} className="w-30 h-30 sm:w-40 sm:h-40 rounded-full object-contain shadow-[0_0_60px_rgba(220,38,38,0.4)]" style={{ animation: "navLogoFloat3D 6s ease-in-out infinite" }} />
          </div>
        </div>
        <div className="font-display text-xs sm:text-sm tracking-[0.4em] text-red-500/70 uppercase" style={{ animation: "textBlink 1.5s ease-in-out infinite" }}>
          PARSTAMA
        </div>
        <div className="flex gap-2" style={{ animation: "preloaderDotFadeIn 0.5s ease-out backwards" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "dotBounce 1.2s ease-in-out infinite 0s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "dotBounce 1.2s ease-in-out infinite 0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "dotBounce 1.2s ease-in-out infinite 0.4s" }} />
        </div>
      </div>

      <style>{`
        @keyframes preloaderSpin {
          0% { transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(0.8); opacity: 0; }
          20% { transform: perspective(1000px) rotateY(180deg) rotateX(10deg) scale(1); opacity: 1; }
          80% { transform: perspective(1000px) rotateY(360deg) rotateX(0deg) scale(1); opacity: 1; }
          100% { transform: perspective(1000px) rotateY(360deg) rotateX(0deg) scale(0.8); opacity: 0; }
        }
        @keyframes preloaderLogoFloat {
          0%, 100% { transform: perspective(800px) rotateY(-8deg) rotateX(3deg) translateY(0px); }
          50% { transform: perspective(800px) rotateY(8deg) rotateX(-3deg) translateY(-10px); }
        }
        @keyframes orbitRing {
          from { transform: rotate(0deg) rotateX(60deg); }
          to { transform: rotate(360deg) rotateX(60deg); }
        }
        @keyframes textBlink {
          0%, 100% { opacity: 0.5; letter-spacing: 0.4em; }
          50% { opacity: 1; letter-spacing: 0.6em; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes preloaderDotFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes preloaderFadeOut {
          to { opacity: 0; pointer-events: none; visibility: hidden; }
        }
      `}</style>
    </div>
  )
}