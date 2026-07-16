"use client"

import React from "react"

interface GlowingButtonProps {
  preset?: "aurora" | "cyber" | "ember" | "glass"
  speed?: "slow" | "normal" | "fast"
  glowIntensity?: "none" | "low" | "medium" | "high"
  shape?: "pill" | "rounded"
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
  href?: string
}

const gradients = {
  aurora: "conic-gradient(from 0deg, transparent 0deg, #3b82f6 60deg, #d946ef 120deg, #8b5cf6 180deg, #06b6d4 240deg, #3b82f6 300deg, transparent 360deg)",
  cyber: "conic-gradient(from 0deg, transparent 0deg, #10b981 30deg, transparent 70deg, transparent 180deg, #06b6d4 210deg, transparent 250deg, transparent 360deg)",
  ember: "conic-gradient(from 0deg, transparent 0deg, #3b82f6 60deg, #7c3aed 150deg, #a855f7 240deg, #3b82f6 330deg, transparent 360deg)",
  glass: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.05) 90deg, rgba(255,255,255,0.7) 180deg, rgba(255,255,255,0.05) 270deg, rgba(255,255,255,0.7) 360deg)",
}

const animationSpeeds = {
  slow: "animate-[spin_8s_linear_infinite]",
  normal: "animate-[spin_4s_linear_infinite]",
  fast: "animate-[spin_1.8s_linear_infinite]",
}

const glows = {
  none: "hidden",
  low: "blur-[8px] opacity-35 group-hover:opacity-55",
  medium: "blur-[16px] opacity-60 group-hover:opacity-85",
  high: "blur-[28px] opacity-85 group-hover:opacity-100",
}

const shapes = {
  pill: { wrapper: "rounded-full", inner: "rounded-full" },
  rounded: { wrapper: "rounded-xl", inner: "rounded-[10.5px]" },
}

export default function GlowingButton({
  preset = "aurora",
  speed = "normal",
  glowIntensity = "medium",
  shape = "pill",
  disabled = false,
  onClick,
  children,
  icon: Icon,
  className = "",
}: GlowingButtonProps) {
  const selectedGradient = gradients[preset] || gradients.aurora
  const selectedSpeed = animationSpeeds[speed] || animationSpeeds.normal
  const selectedGlow = glows[glowIntensity] || glows.medium
  const selectedShape = shapes[shape] || shapes.pill

  const innerBg =
    preset === "glass"
      ? "bg-white/[0.03] backdrop-blur-md group-hover:bg-white/[0.07]"
      : "bg-[#09090b] group-hover:bg-[#121215]"

  return (
    <button
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      className={`relative inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer outline-none select-none transition-transform duration-200 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:scale-[1.025] active:scale-[0.97] disabled:cursor-not-allowed group ${selectedShape.wrapper} ${className}`}
    >
      {/* Outer Ambient Glow */}
      {!disabled && glowIntensity !== "none" && (
        <div className={`absolute inset-[-2px] -z-10 pointer-events-none transition-opacity duration-300 overflow-hidden ${selectedShape.wrapper} ${selectedGlow}`}>
          <div
            style={{ backgroundImage: selectedGradient }}
            className={`absolute top-[-150%] left-[-150%] w-[400%] h-[400%] origin-center ${selectedSpeed}`}
          />
        </div>
      )}

      {/* Rotating Border Outline */}
      <div className={`absolute inset-0 p-[1.5px] overflow-hidden -z-10 pointer-events-none ${selectedShape.wrapper} ${disabled ? "bg-white/5" : ""}`}>
        {!disabled && (
          <div
            style={{ backgroundImage: selectedGradient }}
            className={`absolute top-[-150%] left-[-150%] w-[400%] h-[400%] origin-center ${selectedSpeed}`}
          />
        )}
      </div>

      {/* Inner Mask Content */}
      <span
        className={`relative z-10 m-[1.5px] py-3 px-7 inline-flex items-center justify-center gap-2 font-sans text-sm font-semibold text-white transition-all duration-300 ${selectedShape.inner} ${disabled ? "bg-white/2 text-white/20" : innerBg}`}
      >
        {Icon && <Icon size={16} className="opacity-80" />}
        {children}
      </span>
    </button>
  )
}
