"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 14 }}>
          <p>Token tidak valid.</p>
          <Link href="/login" style={{ color: "#F59E0B", textDecoration: "none" }}>Kembali ke login</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage("Password tidak cocok")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const r = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const d = await r.json()
      if (r.ok) {
        setSuccess(true)
        setMessage(d.message)
      } else {
        setMessage(d.error || "Gagal mengubah password")
      }
    } catch {
      setMessage("Gagal mengubah password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 32, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16 }}>
        <h1 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 22, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 8 }}>Reset Password</h1>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, textAlign: "center", marginBottom: 24 }}>Masukkan password baru Anda</p>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#34D399", fontSize: 14, marginBottom: 16 }}>{message}</p>
            <Link href="/login" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg,#E87A1A,#F59E0B)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password baru"
                required
                minLength={6}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password"
                required
                minLength={6}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              style={{ width: "100%", padding: "10px 24px", background: "linear-gradient(135deg,#E87A1A,#F59E0B)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading || !password || !confirmPassword ? 0.5 : 1 }}
            >
              {loading ? "Mengubah..." : "Ubah Password"}
            </button>
            {message && <p style={{ color: "#F87171", fontSize: 12, textAlign: "center", marginTop: 10 }}>{message}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}>Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
