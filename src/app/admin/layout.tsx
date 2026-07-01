"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import "./admin.css"

const pageConfig: Record<string, { title: string }> = {
  "/admin/dashboard": { title: "Admin Dashboard" },
  "/admin/registrations": { title: "Pendaftaran" },
  "/admin/organization": { title: "Organisasi" },
  "/admin/articles": { title: "Artikel" },
  "/admin/events": { title: "Event" },
  "/admin/profile": { title: "Profile Admin" },
  "/admin/register": { title: "Tambah Admin" },
}

const crossPositions: Record<string, { top?: string; right?: string; bottom?: string; left?: string; width: number; height: number; anim: string }[]> = {
  "/admin/dashboard": [
    { top: "10%", right: "5%", width: 20, height: 20, anim: "dashCross1 9s ease-in-out infinite" },
    { bottom: "15%", left: "8%", width: 16, height: 16, anim: "dashCross2 11s ease-in-out infinite 2s" },
  ],
  "/admin/registrations": [
    { top: "8%", right: "4%", width: 18, height: 18, anim: "dashCross1 10s ease-in-out infinite" },
  ],
  "/admin/organization": [
    { top: "5%", left: "3%", width: 20, height: 20, anim: "dashCross1 9s ease-in-out infinite" },
    { bottom: "10%", right: "4%", width: 16, height: 16, anim: "dashCross1 12s ease-in-out infinite 2s" },
  ],
  "/admin/profile": [
    { top: "15%", right: "6%", width: 18, height: 18, anim: "dashCross1 10s ease-in-out infinite" },
  ],
  "/admin/register": [
    { top: "12%", left: "8%", width: 18, height: 18, anim: "dashCross1 10s ease-in-out infinite" },
    { bottom: "18%", right: "10%", width: 14, height: 14, anim: "dashCross1 12s ease-in-out infinite 2s" },
  ],
}

const defaultCrosses = [
  { top: "10%", right: "5%", width: 18, height: 18, anim: "dashCross1 10s ease-in-out infinite" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    const update = () => setCurrentTime(
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    )
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [])

  const config = pageConfig[pathname] || { title: "Admin" }
  const crosses = crossPositions[pathname] || defaultCrosses
  const isDashboard = pathname === "/admin/dashboard"

  if (status === "loading") {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>Memuat...</span>
      </div>
    )
  }

  if (!session) return null

  const navIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      website: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
      pendaftaran: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
      profile: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      "plus-admin": <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
      logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
      organisasi: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
      dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
      artikel: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
      event: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    }
    return icons[name] || null
  }

  const navLinks = [
    { href: "/admin/registrations", label: "Pendaftaran", icon: "pendaftaran" },
    { href: "/admin/organization", label: "Organisasi", icon: "organisasi" },
    { href: "/admin/articles", label: "Artikel", icon: "artikel" },
    { href: "/admin/events", label: "Event", icon: "event" },
    { href: "/admin/profile", label: "Profile", icon: "profile" },
    { href: "/admin/register", label: "+ Admin", icon: "plus-admin" },
  ]

  return (
    <div className="admin-page">
      {crosses.map((c, i) => (
        <div key={i} className="admin-cross" style={{ top: c.top, right: c.right, bottom: c.bottom, left: c.left, width: c.width, height: c.height, animation: c.anim }}>
          <div className="cross-h" />
          <div className="cross-v" />
        </div>
      ))}

      <nav className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-nav-left">
            {!isDashboard && (
              <>
                <Link href="/admin/dashboard" className="admin-back-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  <span className="admin-back-text">Dashboard</span>
                </Link>
                <div className="admin-divider" />
              </>
            )}
            <div className="admin-logos">
              <div className="admin-logo-wrap">
                <Image src="/smkn_logo.png" alt="SMKN" width={60} height={60} className="admin-logo" />
              </div>
              <div className="admin-logo-wrap">
                <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} className="admin-logo" />
              </div>
            </div>
            <div className="admin-nav-title">
              <span className="admin-brand">{config.title}</span>
              <span className="admin-time">{currentTime}</span>
            </div>
          </div>

          <div className="admin-nav-links-desktop">
            <Link href="/" className="admin-nav-link admin-home-link">{navIcon("website")}Website</Link>
            {navLinks.filter(l => l.href !== pathname).map(l => (
              <Link key={l.href} href={l.href} className="admin-nav-link">{navIcon(l.icon)}{l.label}</Link>
            ))}
            <button onClick={() => signOut({ callbackUrl: "/" })} className="admin-nav-link admin-logout-btn">{navIcon("logout")}Logout</button>
          </div>

          <button className="admin-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="admin-mobile-menu">
            <Link href="/" className="admin-mobile-link admin-home-link" onClick={() => setMenuOpen(false)}>{navIcon("website")}Kembali ke Website</Link>
            {!isDashboard && (
              <Link href="/admin/dashboard" className="admin-mobile-link" onClick={() => setMenuOpen(false)}>{navIcon("dashboard")}Dashboard</Link>
            )}
            {navLinks.filter(l => l.href !== pathname).map(l => (
              <Link key={l.href} href={l.href} className="admin-mobile-link" onClick={() => setMenuOpen(false)}>{navIcon(l.icon)}{l.label}</Link>
            ))}
            <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false) }} className="admin-mobile-link admin-logout-btn">{navIcon("logout")}Logout</button>
          </div>
        )}
      </nav>

      {children}
    </div>
  )
}
