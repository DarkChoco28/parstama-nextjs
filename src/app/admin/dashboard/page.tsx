"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [analytics, setAnalytics] = useState<{ today: number; thisWeek: number; thisMonth: number; dailyData: { date: string; count: number }[] } | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

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

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status === "authenticated") { fetchStats(); fetchAnalytics(); fetchRegistrationStatus() } }, [status])
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

  if (status === "loading" || isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>Memuat data...</span>
        <style>{adminCss}</style>
      </div>
    )
  }
  if (!session) return null

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
      <style>{adminCss}</style>

      <div className="admin-header">
        <h2 className="admin-title">Statistik Pendaftaran</h2>
        <p className="admin-subtitle">Ringkasan data pendaftaran PARSTAMA</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statCards.map((card, i) => (
          <div key={card.label} className="admin-stat-card" style={{ background: card.gradient, borderColor: card.border, animationDelay: `${i * 0.5}s` }}>
            <div className="admin-stat-label">{card.label}</div>
            <div className="admin-stat-value" style={{ color: card.color }}>{card.value}</div>
          </div>
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
                  {analytics.dailyData.map((_, index: number) => (
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
            { href: "/admin/register", label: "Tambah Admin", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", color: "#3B82F6" },
            { href: "/admin/profile", label: "Edit Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "#8B5CF6" },
          ].map(a => (
            <Link key={a.href} href={a.href} className="admin-action-card" style={{ "--accent": a.color } as React.CSSProperties}>
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
      </div>
    </main>
  )
}

const adminCss = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes cardFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
@keyframes borderGlow { 0%,100%{border-color:rgba(220,38,38,.2)}50%{border-color:rgba(220,38,38,.4)} }
@keyframes dashPulse { 0%,100%{box-shadow:0 0 20px rgba(220,38,38,.08)}50%{box-shadow:0 0 30px rgba(220,38,38,.15)} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.admin-loading{min-height:100vh;background:#0A0A0B;display:flex;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,.5);font-size:15px}
.admin-loading-spinner{width:20px;height:20px;border:2px solid rgba(220,38,38,.3);border-top-color:#DC2626;border-radius:50%;animation:spin .8s linear infinite}

/* MAIN */
.admin-main{max-width:1200px;margin:0 auto;padding:20px 16px;position:relative;z-index:1}
.admin-header{margin-bottom:24px}
.admin-title{font-family:'Sansita',Georgia,serif;font-size:22px;font-weight:700;background:linear-gradient(90deg,#EF4444,#DC2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.admin-subtitle{color:rgba(255,255,255,.4);font-size:13px;margin-top:4px}

/* STATS */
.admin-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px}
.admin-stat-card{border-radius:14px;border:1px solid;padding:18px 16px;animation:cardFloat 4s ease-in-out infinite,borderGlow 3s ease-in-out infinite}
.admin-stat-label{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px;font-weight:500}
.admin-stat-value{font-size:28px;font-weight:800;line-height:1}

/* TIME STATS */
.admin-time-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.admin-time-stat{background:rgba(20,20,22,.8);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center;display:flex;flex-direction:column;gap:4px}
.admin-time-label{font-size:11px;color:rgba(255,255,255,.4);font-weight:500}
.admin-time-value{font-size:22px;font-weight:800}

/* CHART */
.chart-container{margin-top:16px}

/* CARD */
.admin-card{background:rgba(20,20,22,.8);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.08);padding:20px;animation:dashPulse 4s ease-in-out infinite}
.admin-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.admin-card-title{font-family:'Sansita',Georgia,serif;font-size:16px;font-weight:700;color:#fff}
.admin-card-desc{color:rgba(255,255,255,.4);font-size:12px;margin-top:2px}
.admin-toggle-btn{padding:10px 18px;border-radius:10px;border:none;font-weight:700;font-size:13px;cursor:pointer;transition:all .3s;flex-shrink:0;font-family:inherit}
.admin-toggle-close{background:rgba(239,68,68,.15);color:#EF4444;border:1px solid rgba(239,68,68,.3)}
.admin-toggle-open{background:rgba(52,211,153,.15);color:#34D399;border:1px solid rgba(52,211,153,.3)}

/* ACTIONS */
.admin-actions-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06)}
.admin-action-card{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:rgba(255,255,255,.7);font-size:13px;font-weight:600;text-decoration:none;transition:all .3s}
.admin-action-card:active{transform:scale(.98);opacity:.8}

/* NOTIFICATIONS */
.admin-notif-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06)}
.admin-notif-grid{display:grid;grid-template-columns:1fr;gap:10px}
.admin-notif-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 16px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s;font-family:inherit;border:1px solid}
.admin-notif-btn:disabled{opacity:.5;cursor:not-allowed}
.admin-notif-btn:not(:disabled):active{transform:scale(.98)}
.admin-notif-whatsapp{background:rgba(37,211,102,.1);color:#25D366;border-color:rgba(37,211,102,.3)}
.admin-notif-whatsapp:not(:disabled):hover{background:rgba(37,211,102,.2)}
.admin-notif-broadcast{background:rgba(59,130,246,.1);color:#3B82F6;border-color:rgba(59,130,246,.3)}
.admin-notif-broadcast:not(:disabled):hover{background:rgba(59,130,246,.2)}

@media(min-width:640px){
  .admin-main{padding:32px 24px}
  .admin-title{font-size:28px}
  .admin-stat-card{padding:24px}
  .admin-stat-value{font-size:36px}
  .admin-card{padding:28px 32px}
  .admin-card-title{font-size:18px}
  .admin-card-desc{font-size:13px}
  .admin-toggle-btn{padding:12px 24px;font-size:14px}
  .admin-actions-grid{grid-template-columns:repeat(3,1fr)}
  .admin-action-card{padding:14px 18px}
  .admin-notif-grid{grid-template-columns:repeat(2,1fr)}
}

@media(max-width:767px){
  .admin-stats-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .admin-stat-card{padding:16px}
  .admin-stat-value{font-size:24px}
  .admin-stat-label{font-size:11px}
  .admin-time-stats{grid-template-columns:repeat(3,1fr);gap:8px}
  .admin-time-stat{padding:10px}
  .admin-time-value{font-size:18px}
  .admin-time-label{font-size:10px}
  .admin-toggle-row{flex-direction:column;align-items:stretch;text-align:center}
  .admin-toggle-btn{width:100%}
  .admin-actions-grid{grid-template-columns:1fr}
  .admin-notif-grid{grid-template-columns:1fr}
}

@media(max-width:380px){
  .admin-main{padding:16px 12px}
  .admin-title{font-size:20px}
  .admin-stats-grid{gap:8px}
  .admin-stat-card{padding:14px 12px;border-radius:12px}
  .admin-stat-value{font-size:22px}
  .admin-time-stats{gap:6px}
  .admin-time-stat{padding:8px}
  .admin-time-value{font-size:16px}
  .admin-card{padding:16px;border-radius:14px}
}
`
