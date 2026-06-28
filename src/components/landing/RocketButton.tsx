"use client"

import { useState, useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from "react"
import { useRouter } from "next/navigation"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  life: number
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [launching, setLaunching] = useState(false)
  const [rocketStyle, setRocketStyle] = useState<React.CSSProperties>({})
  const [curtainUp, setCurtainUp] = useState(false)
  const [curtainDown, setCurtainDown] = useState(false)
  const animFrame = useRef<number>(0)

  const spawnParticles = useCallback((startX: number, startY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const colors = ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FBBF24", "#F97316", "#FFFFFF"]

    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
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

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
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
        animFrame.current = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animFrame.current = requestAnimationFrame(draw)
  }, [])

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (launching) return

      const btn = btnRef.current
      if (!btn) return

      const rect = btn.getBoundingClientRect()
      const startX = rect.left + rect.width / 2
      const startY = rect.top + rect.height / 2

      setLaunching(true)

      spawnParticles(startX, startY)

      requestAnimationFrame(() => {
        setRocketStyle({
          position: "fixed",
          left: `${startX}px`,
          top: `${startY}px`,
          transform: "translate(-50%, -50%) scale(1)",
          transition: "none",
          zIndex: 9999,
        })

        requestAnimationFrame(() => {
          setRocketStyle({
            position: "fixed",
            left: `${startX}px`,
            top: `${startY}px`,
            transform: "translate(-50%, -50%) scale(0.6) rotate(360deg)",
            opacity: "0",
            transition: "all 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
            zIndex: 9999,
          })
        })
      })

      setTimeout(() => {
        setCurtainUp(true)
      }, 400)

      setTimeout(() => {
        router.push(href)
      }, 900)
    },
    [launching, href, router, spawnParticles]
  )

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 99999 }}
      />

      {launching && (
        <div style={rocketStyle} className="pointer-events-none">
          <svg width="48" height="48" viewBox="0 0 200 200" fill="none">
            <rect x="75" y="10" width="50" height="180" rx="10" fill="#DC2626" />
            <rect x="10" y="75" width="180" height="50" rx="10" fill="#DC2626" />
          </svg>
          <div
            className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-8 h-16 rounded-full opacity-60"
            style={{
              background: "radial-gradient(ellipse at top, #EF4444 0%, #F97316 40%, transparent 70%)",
              filter: "blur(4px)",
              animation: "flameFlicker 0.15s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {curtainUp && (
        <div
          className="fixed inset-0 z-[9998]"
          style={{
            background: "#0A0A0B",
            transform: "translateY(100%)",
            animation: "curtainSlide 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards",
          }}
        />
      )}

      <button
        ref={btnRef}
        onClick={handleClick}
        className={className}
        disabled={launching}
      >
        {children}
      </button>

      <style>{`
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
