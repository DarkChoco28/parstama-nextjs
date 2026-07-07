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
    <>
      <style>{adminCss}</style>

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
    </>
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
