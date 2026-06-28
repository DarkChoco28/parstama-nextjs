"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function AdminProfile() {
  const { data: session, status } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    try { const r = await fetch("/api/admin/profile"); const d = await r.json(); setName(d.name || ""); setEmail(d.email || "") }
    catch { setError("Gagal memuat data profile") } finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status === "authenticated") fetchProfile() }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(""); setError("")
    if (newPassword && newPassword !== confirmPassword) { setError("Konfirmasi password baru tidak cocok"); return }
    setSaving(true)
    try {
      const r = await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }) })
      const d = await r.json()
      if (!r.ok) { setError(d.error || "Terjadi kesalahan"); return }
      setMessage("Profile berhasil diupdate"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch { setError("Terjadi kesalahan saat menyimpan") } finally { setSaving(false) }
  }

  if (status === "loading" || loading) {
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat data...</span></div>)
  }
  if (!session) return null

  return (
    <>
      <main className="form-main">
        <div className="form-card">
          <div className="form-accent" />
          {message && <div className="form-alert form-alert-success">{message}</div>}
          {error && <div className="form-alert form-alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-body">
            <div>
              <h2 className="form-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Informasi Akun
              </h2>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" required />
              </div>
            </div>

            <div className="form-divider" />

            <div>
              <h2 className="form-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Ganti Password
              </h2>
              <p className="form-section-desc">Kosongkan jika tidak ingin mengganti password</p>
              <div className="form-group">
                <label className="form-label">Password Saat Ini</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="admin-input" placeholder="Masukkan password saat ini" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="admin-input" placeholder="Minimal 6 karakter" />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="admin-input" placeholder="Ulangi password baru" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Link href="/admin/dashboard" className="form-btn-cancel">Batal</Link>
              <button type="submit" disabled={saving} className="form-btn-submit">{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
          </form>
        </div>
      </main>

      <style>{`
        .form-main{max-width:560px;margin:0 auto;padding:20px 16px;position:relative;z-index:1}
        .form-card{background:rgba(20,20,22,.8);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.08);padding:20px;position:relative;overflow:hidden}
        .form-accent{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#DC2626,#EF4444,#DC2626,transparent)}
        .form-alert{padding:12px 16px;border-radius:12px;font-size:13px;margin-bottom:16px;text-align:center}
        .form-alert-success{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34D399;font-weight:600}
        .form-alert-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444}
        .form-body{display:flex;flex-direction:column;gap:20px}
        .form-section-title{font-family:'Sansita',Georgia,serif;font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;margin-bottom:14px}
        .form-section-desc{color:rgba(255,255,255,.35);font-size:12px;margin:-8px 0 14px}
        .form-divider{border-top:1px solid rgba(255,255,255,.06)}
        .form-group{display:flex;flex-direction:column;gap:6px}
        .form-label{font-size:13px;font-weight:600;color:rgba(255,255,255,.7)}
        .form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .form-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)}
        .form-btn-cancel{padding:12px 24px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.6);font-size:14px;font-weight:600;text-decoration:none;transition:all .3s}
        .form-btn-cancel:hover{background:rgba(255,255,255,.05);color:#fff}
        .form-btn-submit{padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit}
        .form-btn-submit:hover:not(:disabled){box-shadow:0 0 25px rgba(220,38,38,.4);transform:translateY(-1px)}
        .form-btn-submit:disabled{opacity:.5;cursor:not-allowed}
        .admin-input{padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;outline:none;font-family:inherit;transition:border-color .3s,box-shadow .3s;width:100%}
        .admin-input:focus{border-color:rgba(220,38,38,.5);box-shadow:0 0 15px rgba(220,38,38,.15)}
        .admin-input::placeholder{color:rgba(255,255,255,.3)}
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
      `}</style>
    </>
  )
}
