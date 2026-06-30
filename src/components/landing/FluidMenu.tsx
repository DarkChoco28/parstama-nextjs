"use client"

import { useState } from "react"
import Link from "next/link"

const items = [
  { label: "Tentang", href: "#tentang", icon: "M12 16v-4M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" },
  { label: "Syarat", href: "#syarat", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8" },
  { label: "Timeline", href: "#timeline", icon: "M3 4h18v2H3V4zm0 6h18v2H3v-2zm0 6h18v2H3v-2zM16 2v4M8 2v4" },
  { label: "Blog", href: "/blog", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" },
  { label: "Event", href: "/events", icon: "M3 4h18v18H3z" },
  { label: "Tanya AI", href: "/cek-status", icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
  { label: "Struktur", href: "/struktur-organisasi", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { label: "Login", href: "/login", icon: "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" },
  { label: "WhatsApp", href: "https://wa.me/6281459145800", icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z", external: true, wa: true },
  { label: "Daftar", href: "/daftar", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 7a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6", cta: true },
]

export default function FluidMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[8999] bg-black/40 backdrop-blur-sm opacity-0 animate-in fade-in duration-300" style={{ opacity: open ? 1 : 0 }} onClick={() => setOpen(false)} />
      )}
      <div className={`fixed bottom-7 right-5 z-[9000] w-14 sm:hidden ${open ? "open" : ""}`}>
        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 rounded-full bg-linear-to-br from-red-600 to-red-800 border-none cursor-pointer z-[9010] flex items-center justify-center shadow-[0_4px_24px_rgba(220,38,38,0.4)] active:scale-95 transition-transform"
        >
          <span className="absolute inset-[-6px] rounded-full border-2 border-red-500/30" style={{ animation: open ? "none" : "pulse 2.5s ease-in-out infinite" }} />
          <svg className="absolute w-6 h-6 text-white transition-all duration-300" style={{ opacity: open ? 0 : 1, transform: open ? "scale(0) rotate(180deg)" : "scale(1) rotate(0deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <svg className="absolute w-6 h-6 text-white transition-all duration-300" style={{ opacity: open ? 1 : 0, transform: open ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="absolute bottom-0 right-0 w-14">
          {items.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener" : undefined}
              className={`absolute bottom-0 right-0 w-12 h-12 rounded-full flex items-center justify-center no-underline cursor-pointer shadow-lg transition-all duration-300 ${
                item.cta
                  ? "bg-linear-to-br from-red-600 to-red-800 border-none"
                  : item.wa
                  ? "bg-[rgba(24,24,27,0.95)] border border-[rgba(37,211,102,0.3)]"
                  : "bg-[rgba(24,24,27,0.95)] border border-white/10"
              }`}
              style={{
                pointerEvents: open ? "auto" : "none",
                opacity: open ? 1 : 0,
                transform: open ? `translateY(-${(i + 1) * 56}px) scale(1)` : "translateY(0) scale(0.6)",
                transitionDelay: open ? `${i * 0.03}s` : `${(items.length - 1 - i) * 0.02}s`,
                color: item.wa ? "#25D366" : undefined,
              }}
              onClick={() => setOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
