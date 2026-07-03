"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminRegister() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    update(); const i = setInterval(update, 1000); return () => clearInterval(i)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(""); setError("")
    if (!name.trim()) { setError("Nama lengkap wajib diisi"); return }
    if (!email.trim()) { setError("Email wajib diisi"); return }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak cocok"); return }
    setSaving(true)
    try {
      const r = await fetch("/api/admin/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) })
      const d = await r.json()
      if (!r.ok) { setError(d.error || "Terjadi kesalahan"); return }
      setMessage(`Admin "${d.user.name}" berhasil dibuat!`); setName(""); setEmail(""); setPassword(""); setConfirmPassword("")
    } catch { setError("Terjadi kesalahan saat menyimpan") } finally { setSaving(false) }
  }

  if (status === "loading") {
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat...</span><style>{adminCss}</style></div>)
  }
  if (!session) return null

  return (
    <div className="admin-page">
      <style>{adminCss}</style>
      <div className="admin-cross" style={{ top: "12%", left: "8%", width: 18, height: 18, animation: "dashCross1 10s ease-in-out infinite" }}>
        <div className="cross-h" /><div className="cross-v" />
      </div>
      <div className="admin-cross" style={{ bottom: "18%", right: "10%", width: 14, height: 14, animation: "dashCross1 12s ease-in-out infinite 2s" }}>
        <div className="cross-h" /><div className="cross-v" />
      </div>

      {/* NAVBAR */}
      <nav className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-nav-left">
            <Link href="/admin/dashboard" className="admin-back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              <span className="admin-back-text">Dashboard</span>
            </Link>
            <div className="admin-divider" />
            <div className="admin-logos">
              <div className="admin-logo-wrap"><img src="/smkn_logo.png" alt="SMKN" className="admin-logo" /></div>
              <div className="admin-logo-wrap"><img src="/parstama_logo.png" alt="PARSTAMA" className="admin-logo" /></div>
            </div>
            <div className="admin-nav-title">
              <span className="admin-brand">Tambah Admin</span>
              <span className="admin-time">{currentTime}</span>
            </div>
          </div>
          <button className="admin-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>}
          </button>
          <div className="admin-nav-links-desktop">
            <Link href="/" className="admin-nav-link admin-home-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Website</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="admin-nav-link admin-logout-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Logout</button>
          </div>
        </div>
        {menuOpen && (
          <div className="admin-mobile-menu">
            <Link href="/" className="admin-mobile-link admin-home-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Kembali ke Website</Link>
            <Link href="/admin/dashboard" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>Dashboard</Link>
            <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false) }} className="admin-mobile-link admin-logout-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Logout</button>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="form-main">
        <div className="form-card">
          <div className="form-accent" />
          {message && <div className="form-alert form-alert-success">{message}</div>}
          {error && <div className="form-alert form-alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" required aria-label="Nama Lengkap" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" required aria-label="Email" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" placeholder="Minimal 6 karakter" required aria-label="Password" />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="admin-input" placeholder="Ulangi password" required aria-label="Konfirmasi Password" />
              </div>
            </div>
            <div className="form-actions">
              <Link href="/admin/dashboard" className="form-btn-cancel">Batal</Link>
              <button type="submit" disabled={saving} className="form-btn-submit">{saving ? "Menyimpan..." : "Buat Admin"}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

const adminCss = `
.form-main{max-width:520px;margin:0 auto;padding:20px 16px;position:relative;z-index:1}
.form-card{background:rgba(20,20,22,.8);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.08);padding:20px;position:relative;overflow:hidden}
.form-accent{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#DC2626,#EF4444,#DC2626,transparent)}
.form-alert{padding:12px 16px;border-radius:12px;font-size:13px;margin-bottom:16px;text-align:center}
.form-alert-success{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34D399;font-weight:600}
.form-alert-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444}
.form-body{display:flex;flex-direction:column;gap:16px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-label{font-size:13px;font-weight:600;color:rgba(255,255,255,.7)}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)}
.form-btn-cancel{padding:12px 24px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.6);font-size:14px;font-weight:600;text-decoration:none;transition:all .3s}
.form-btn-cancel:hover{background:rgba(255,255,255,.05);color:#fff}
.form-btn-submit{padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit}
.form-btn-submit:hover:not(:disabled){box-shadow:0 0 25px rgba(220,38,38,.4);transform:translateY(-1px)}
.form-btn-submit:disabled{opacity:.5;cursor:not-allowed}

@media(min-width:640px){
  .form-main{padding:40px 24px}
  .form-card{padding:32px}
}
@media(max-width:767px){
  .form-row-2{grid-template-columns:1fr;gap:14px}
  .form-actions{flex-direction:column}
  .form-btn-cancel,.form-btn-submit{width:100%;text-align:center}
}
@media(max-width:380px){
  .form-main{padding:16px 12px}
  .form-card{padding:16px}
}
`
