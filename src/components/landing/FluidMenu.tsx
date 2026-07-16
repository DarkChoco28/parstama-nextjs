"use client"

import { useState } from "react"


const items = [
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
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="relative w-14 h-14 rounded-full bg-linear-to-br from-red-600 to-red-800 border-none cursor-pointer z-[9010] flex items-center justify-center shadow-[0_4px_24px_rgba(220,38,38,0.4)] active:scale-95 transition-transform"
        >
          <span className="absolute -inset-1.5 rounded-full border-2 border-red-500/30" style={{ animation: open ? "none" : "pulse 2.5s ease-in-out infinite" }} />
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
              aria-label={item.label}
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
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 rounded bg-zinc-900/90 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-md">
                {item.label}
              </span>
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
