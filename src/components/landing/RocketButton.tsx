"use client"

import { useState, useRef, useCallback, useEffect, type ReactNode, type MouseEvent as ReactMouseEvent } from "react"
import { useRouter } from "next/navigation"

interface Particle {
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  life: number
}

let globalCanvas: HTMLCanvasElement | null = null
let globalCtx: CanvasRenderingContext2D | null = null
let activeFrame = 0

function getCanvas() {
  if (typeof window === "undefined") return null
  if (globalCanvas && document.body.contains(globalCanvas)) return globalCanvas

  globalCanvas = document.createElement("canvas")
  globalCanvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;"
  document.body.appendChild(globalCanvas)
  globalCtx = globalCanvas.getContext("2d")
  return globalCanvas
}

function spawnParticles(startX: number, startY: number) {
  const canvas = getCanvas()
  if (!canvas || !globalCtx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = globalCtx

  const particles: Particle[] = []
  const colors = ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FBBF24", "#F97316", "#FFFFFF"]

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: startX,
      y: startY,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 3,
      life: 1,
    })
  }

  let frame = 0
  const maxFrames = 50
  activeFrame++

  const myFrame = activeFrame

  const draw = () => {
    if (myFrame !== activeFrame) return
    ctx.clearRect(0, 0, canvas!.width, canvas!.height)
    frame++
    const progress = frame / maxFrames

    particles.forEach((p) => {
      p.x += p.vx * (1 - progress * 0.5)
      p.y += p.vy * (1 - progress * 0.5)
      p.vy += 0.3
      p.life = Math.max(0, 1 - progress)
      p.size *= 0.97

      ctx.globalAlpha = p.life * 0.8
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()

      ctx.globalAlpha = p.life * 0.3
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    })

    ctx.globalAlpha = 1

    if (frame < maxFrames) {
      requestAnimationFrame(draw)
    } else {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
    }
  }

  requestAnimationFrame(draw)
}

export default function RocketButton({
  children,
  href = "/daftar",
  className = "",
}: {
  children: ReactNode
  href?: string
  className?: string
}) {
  const router = useRouter()
  const btnRef = useRef<HTMLButtonElement>(null)
  const launchingRef = useRef(false)
  const [rocket, setRocket] = useState<{ x: number; y: number; phase: "idle" | "launch" | "done" }>({ x: 0, y: 0, phase: "idle" })
  const [curtainUp, setCurtainUp] = useState(false)

  useEffect(() => {
    return () => {
      if (globalCanvas && document.body.contains(globalCanvas)) {
        document.body.removeChild(globalCanvas)
        globalCanvas = null
        globalCtx = null
      }
    }
  }, [])

  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_e: ReactMouseEvent<HTMLButtonElement>) => {
      if (launchingRef.current) return
      launchingRef.current = true

      const btn = btnRef.current
      if (!btn) return

      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      spawnParticles(cx, cy)

      setRocket({ x: cx, y: cy, phase: "launch" })

      setTimeout(() => setCurtainUp(true), 400)
      setTimeout(() => router.push(href), 900)
    },
    [href, router]
  )

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        className={className}
        style={rocket.phase === "launch" ? { opacity: 0, pointerEvents: "none" } : undefined}
      >
        {children}
      </button>

      {rocket.phase === "launch" && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: rocket.x,
            top: rocket.y,
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 200 200"
            fill="none"
            style={{
              animation: "rocketFly 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards",
            }}
          >
            <rect x="75" y="10" width="50" height="180" rx="10" fill="#DC2626" />
            <rect x="10" y="75" width="180" height="50" rx="10" fill="#DC2626" />
          </svg>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -8,
              transform: "translateX(-50%)",
              width: 32,
              height: 48,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at top, #EF4444 0%, #F97316 40%, transparent 70%)",
              filter: "blur(4px)",
              animation: "flameFlicker 0.1s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {curtainUp && (
        <div
          className="fixed inset-0"
          style={{
            background: "#0A0A0B",
            zIndex: 9998,
            animation: "curtainSlide 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards",
          }}
        />
      )}

      <style>{`
        @keyframes rocketFly {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(0.8) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(0.3) rotate(360deg) translateY(-200px); opacity: 0; }
        }
        @keyframes flameFlicker {
          0% { transform: translateX(-50%) scaleX(0.8) scaleY(1.1); opacity: 0.5; }
          100% { transform: translateX(-50%) scaleX(1.2) scaleY(0.9); opacity: 0.8; }
        }
        @keyframes curtainSlide {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0%); }
        }
      `}</style>
    </>
  )
}
