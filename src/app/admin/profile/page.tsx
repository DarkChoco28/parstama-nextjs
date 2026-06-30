"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])
  useEffect(() => { if (status === "authenticated") fetchProfile() }, [status])

  const fetchProfile = async () => {
    try { const r = await fetch("/api/admin/profile"); const d = await r.json(); setName(d.name || ""); setEmail(d.email || "") }
    catch { setError("Gagal memuat data profile") } finally { setLoading(false) }
  }

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
    <main className="admin-main">
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
  )
}

