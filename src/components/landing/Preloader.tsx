"use client"

import { useState } from "react"

export default function Preloader() {
  const [phase, setPhase] = useState<"playing" | "curtain" | "done">("playing")

  if (phase === "done") return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        zIndex: 99999,
        background: "#FFFFFF",
        opacity: phase === "curtain" ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: phase === "curtain" ? "none" : "auto",
      }}
    >
      <video
        src="/preloader.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => {
          setPhase("curtain")
          setTimeout(() => setPhase("done"), 600)
        }}
        className="w-full h-full object-contain sm:object-cover"
      />
    </div>
  )
}
