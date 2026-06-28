"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])
  return count
}

function StatCard({ label, target, color, gradient, border, delay }: { label: string; target: number; color: string; gradient: string; border: string; delay: number }) {
  const value = useAnimatedCounter(target)
  return (
    <div className="admin-stat-card" style={{ background: gradient, borderColor: border, animationDelay: `${delay}s` }}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value counting" style={{ color }}>{value}</div>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <main className="admin-main">
      <div className="admin-header">
        <div className="admin-skeleton" style={{ width: 220, height: 28, marginBottom: 8 }} />
        <div className="admin-skeleton" style={{ width: 180, height: 16 }} />
      </div>
      <div className="admin-stats-grid">
        {[0,1,2,3].map(i => <div key={i} className="admin-skeleton admin-skeleton-card" />)}
      </div>
      <div className="admin-skeleton-row">
        {[0,1,2].map(i => <div key={i} className="admin-skeleton admin-skeleton-block" />)}
      </div>
      <div className="admin-skeleton admin-skeleton-chart" style={{ marginBottom: 16 }} />
      <div className="admin-skeleton" style={{ height: 200, borderRadius: 16 }} />
    </main>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [analytics, setAnalytics] = useState<any>(null)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  useEffect(() => { fetchStats(); fetchAnalytics(); fetchRegistrationStatus() }, [])

  const fetchStats = async () => {
    try { const r = await fetch("/api/admin/stats"); const d = await r.json(); setStats(d) }
    catch (e) { console.error(e) } finally { setIsLoading(false) }
  }
  const fetchAnalytics = async () => {
    try { const r = await fetch("/api/admin/analytics"); const d = await r.json(); setAnalytics(d) }
    catch (e) { console.error(e) }
  }
  const fetchRegistrationStatus = async () => {
    try { const r = await fetch("/api/admin/settings/registration-open"); const d = await r.json(); setRegistrationOpen(d.value === "1") }
    catch (e) { console.error(e) }
  }
  const toggleRegistration = async () => {
    setIsToggling(true)
    try {
      const r = await fetch("/api/admin/settings/registration-open", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: registrationOpen ? "0" : "1" }) })
      if (r.ok) setRegistrationOpen(!registrationOpen)
    } catch (e) { console.error(e) } finally { setIsToggling(false) }
  }

  const sendWhatsAppNotif = async (type: string = "single") => {
    setNotifLoading(true)
    try {
      const url = type === "broadcast"
        ? "/api/admin/notifications/whatsapp?type=broadcast"
        : "/api/admin/notifications/whatsapp?type=single"
      const r = await fetch(url)
      const d = await r.json()
      if (d.url) window.open(d.url, "_blank")
    } catch (e) { console.error(e) }
    finally { setNotifLoading(false) }
  }

  if (isLoading) return <SkeletonDashboard />

  const statCards = [
    { label: "Total Pendaftar", value: stats.total, color: "#fff", gradient: "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.05))", border: "rgba(220,38,38,0.2)" },
    { label: "Pending", value: stats.pending, color: "#FCD34D", gradient: "linear-gradient(135deg, rgba(252,211,77,0.15), rgba(252,211,77,0.05))", border: "rgba(252,211,77,0.2)" },
    { label: "Diterima", value: stats.accepted, color: "#34D399", gradient: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))", border: "rgba(52,211,153,0.2)" },
    { label: "Ditolak", value: stats.rejected, color: "#EF4444", gradient: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))", border: "rgba(239,68,68,0.2)" },
  ]

  const timeStats = [
    { label: "Hari Ini", value: analytics?.today || 0, color: "#DC2626" },
    { label: "Minggu Ini", value: analytics?.thisWeek || 0, color: "#F59E0B" },
    { label: "Bulan Ini", value: analytics?.thisMonth || 0, color: "#10B981" },
  ]

  const chartColors = ["#DC2626", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]

  return (
    <main className="admin-main">
        <div className="admin-header">
          <h2 className="admin-title">Statistik Pendaftaran</h2>
          <p className="admin-subtitle">Ringkasan data pendaftaran PARSTAMA</p>
        </div>

        {/* Stats Cards with Animated Counters */}
        <div className="admin-stats-grid">
          {statCards.map((card, i) => (
            <StatCard key={card.label} label={card.label} target={card.value} color={card.color} gradient={card.gradient} border={card.border} delay={i * 0.1} />
          ))}
        </div>

        {/* Time Stats */}
        <div className="admin-time-stats">
          {timeStats.map((t) => (
            <div key={t.label} className="admin-time-stat">
              <span className="admin-time-label">{t.label}</span>
              <span className="admin-time-value" style={{ color: t.color }}>{t.value}</span>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        {analytics?.dailyData && (
          <div className="admin-card" style={{ marginBottom: 16 }}>
            <h3 className="admin-card-title">Pendaftar 7 Hari Terakhir</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.dailyData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,20,22,0.95)",
                      border: "1px solid rgba(220,38,38,0.3)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(220,38,38,0.05)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {analytics.dailyData.map((_: any, index: number) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status & Registration Toggle */}
        <div className="admin-card">
          <div className="admin-toggle-row">
            <div>
              <h3 className="admin-card-title">Status Pendaftaran</h3>
              <p className="admin-card-desc">
                Pendaftaran saat ini{" "}
                <span style={{ fontWeight: 700, color: registrationOpen ? "#34D399" : "#EF4444" }}>
                  {registrationOpen ? "DIBUKA" : "DITUTUP"}
                </span>
              </p>
            </div>
            <button onClick={toggleRegistration} disabled={isToggling} className={`admin-toggle-btn ${registrationOpen ? "admin-toggle-close" : "admin-toggle-open"}`}>
              {isToggling ? "Loading..." : registrationOpen ? "Tutup" : "Buka"}
            </button>
          </div>

          <div className="admin-actions-grid">
            {[
              { href: "/admin/registrations", label: "Lihat Semua Pendaftar", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", color: "#DC2626" },
              { href: "/admin/articles", label: "Kelola Artikel", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", color: "#10B981" },
              { href: "/admin/events", label: "Kelola Event", icon: "M3 4h18v18H3z", color: "#F59E0B" },
              { href: "/admin/register", label: "Tambah Admin", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", color: "#3B82F6" },
              { href: "/admin/profile", label: "Edit Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "#8B5CF6" },
            ].map(a => (
              <Link key={a.href} href={a.href} className="admin-action-card" style={{ "--accent": a.color } as any}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Notification Section */}
          <div className="admin-notif-section">
            <h3 className="admin-card-title" style={{ marginBottom: 12 }}>Notifikasi & Komunikasi</h3>
            <div className="admin-notif-grid">
              <button onClick={() => sendWhatsAppNotif("single")} disabled={notifLoading} className="admin-notif-btn admin-notif-whatsapp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                <span>WhatsApp Panitia</span>
              </button>
              <button onClick={() => sendWhatsAppNotif("broadcast")} disabled={notifLoading} className="admin-notif-btn admin-notif-broadcast">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L15 22l-4-8-8-4z"/></svg>
                <span>Broadcast WA</span>
              </button>
            </div>
          </div>

          {/* Backup Section */}
          <div className="admin-notif-section" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <h3 className="admin-card-title" style={{ marginBottom: 12 }}>Backup Data</h3>
            <a href="/api/admin/export/backup" target="_blank" rel="noopener" className="admin-notif-btn" style={{ background: "rgba(96,165,250,.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,.3)", width: "100%", display: "flex", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Backup (JSON)</span>
            </a>
          </div>
        </div>
      </main>
  )
}
