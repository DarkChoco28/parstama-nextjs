"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

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

      {/* MAIN */}
      <main className="form-main">
        <div className="form-card">
          <div className="form-accent" />
          {message && <div className="form-alert form-alert-success">{message}</div>}
          {error && <div className="form-alert form-alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" placeholder="Minimal 6 karakter" required />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="admin-input" placeholder="Ulangi password" required />
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
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes dashCross1 { 0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.08}33%{transform:translate3d(8px,-5px,0) rotate(5deg);opacity:.15}66%{transform:translate3d(-3px,8px,0) rotate(-3deg);opacity:.1} }
@keyframes menuSlideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.admin-page{min-height:100vh;background:#0A0A0B;font-family:'Plus Jakarta Sans',system-ui,sans-serif;position:relative;overflow-x:hidden}
.admin-loading{min-height:100vh;background:#0A0A0B;display:flex;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,.5);font-size:15px}
.admin-loading-spinner{width:20px;height:20px;border:2px solid rgba(220,38,38,.3);border-top-color:#DC2626;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0}
.admin-cross{position:absolute;z-index:0}
.cross-h{position:absolute;width:100%;height:2px;background:linear-gradient(90deg,transparent,#DC2626,transparent);top:50%;transform:translateY(-50%);border-radius:2px}
.cross-v{position:absolute;height:100%;width:2px;background:linear-gradient(180deg,transparent,#DC2626,transparent);left:50%;transform:translateX(-50%);border-radius:2px}

.admin-nav{background:rgba(10,10,11,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;z-index:50}
.admin-nav-inner{max-width:800px;margin:0 auto;padding:0 16px;display:flex;justify-content:space-between;align-items:center;height:60px}
.admin-nav-left{display:flex;align-items:center;gap:8px;min-width:0}
.admin-back-link{display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.5);font-size:12px;text-decoration:none;padding:5px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.08);transition:all .3s;flex-shrink:0}
.admin-back-link:hover{background:rgba(255,255,255,.06);color:#fff}
.admin-back-text{display:none}
.admin-divider{width:1px;height:20px;background:rgba(255,255,255,.08);flex-shrink:0}
.admin-logos{display:flex;align-items:center;gap:4px;flex-shrink:0}
.admin-logo-wrap{position:relative;width:28px;height:28px}
.admin-logo{width:28px;height:28px;border-radius:50%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(220,38,38,.3))}
.admin-nav-title{display:flex;flex-direction:column;min-width:0}
.admin-brand{font-family:'Sansita',Georgia,serif;font-size:13px;font-weight:700;background:linear-gradient(90deg,#EF4444,#DC2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap}
.admin-time{font-size:10px;color:rgba(255,255,255,.35);font-family:monospace;line-height:1}
.admin-nav-links-desktop{display:flex;align-items:center;gap:6px}
.admin-nav-link{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;color:rgba(255,255,255,.6);font-size:12px;font-weight:500;text-decoration:none;border:1px solid transparent;transition:all .3s;background:none;cursor:pointer;font-family:inherit}
.admin-nav-link:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff}
.admin-logout-btn:hover{background:rgba(220,38,38,.1)!important;border-color:rgba(220,38,38,.3)!important;color:#EF4444!important}
.admin-home-link{color:rgba(255,255,255,.5)!important;border-color:rgba(255,255,255,.08)!important}
.admin-home-link:hover{background:rgba(52,211,153,.1)!important;border-color:rgba(52,211,153,.3)!important;color:#34D399!important}
.admin-hamburger{display:none;background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;color:rgba(255,255,255,.7);cursor:pointer;transition:all .3s}
.admin-hamburger:hover{background:rgba(255,255,255,.06);color:#fff}
.admin-mobile-menu{display:none;flex-direction:column;padding:8px 16px 16px;gap:4px;animation:menuSlideDown .2s ease}
.admin-mobile-link{display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:10px;color:rgba(255,255,255,.7);font-size:14px;font-weight:500;text-decoration:none;border:1px solid rgba(255,255,255,.06);transition:all .3s;background:rgba(255,255,255,.03);cursor:pointer;font-family:inherit}
.admin-mobile-link:active{background:rgba(255,255,255,.08)}
.admin-mobile-link.admin-logout-btn{color:#EF4444;border-color:rgba(220,38,38,.15);background:rgba(220,38,38,.05)}

.admin-input{padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;outline:none;font-family:inherit;transition:border-color .3s,box-shadow .3s;width:100%}
.admin-input:focus{border-color:rgba(220,38,38,.5);box-shadow:0 0 15px rgba(220,38,38,.15)}
.admin-input::placeholder{color:rgba(255,255,255,.3)}

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
  .admin-nav-inner{padding:0 24px;height:68px}
  .admin-back-text{display:inline}
  .admin-logo-wrap{width:32px;height:32px}
  .admin-logo{width:32px;height:32px}
  .admin-brand{font-size:15px}
  .admin-time{font-size:11px}
  .form-main{padding:40px 24px}
  .form-card{padding:32px}
}
@media(min-width:768px){
  .admin-hamburger{display:none!important}
  .admin-mobile-menu{display:none!important}
  .admin-nav-links-desktop{display:flex!important}
}
@media(max-width:767px){
  .admin-nav-links-desktop{display:none}
  .admin-hamburger{display:flex}
  .admin-mobile-menu{display:flex}
  .form-row-2{grid-template-columns:1fr;gap:14px}
  .form-actions{flex-direction:column}
  .form-btn-cancel,.form-btn-submit{width:100%;text-align:center}
}
@media(max-width:380px){
  .admin-nav-inner{height:56px;padding:0 12px}
  .admin-logo-wrap{width:24px;height:24px}
  .admin-logo{width:24px;height:24px}
  .admin-brand{font-size:12px}
  .form-main{padding:16px 12px}
  .form-card{padding:16px}
}
`
