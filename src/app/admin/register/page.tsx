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
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat...</span></div>)
  }
  if (!session) return null

  return (
    <div className="admin-page">

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

