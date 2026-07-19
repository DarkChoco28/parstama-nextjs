"use client"

import { useEffect, useState } from "react"

interface Comment {
  id: string; name: string; content: string; createdAt: string
}

export default function BlogComments({ articleSlug }: { articleSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/articles/${articleSlug}/comments`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [articleSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setSubmitting(true)
    setMessage("")
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: content.trim() }),
      })
      const d = await r.json()
      if (r.ok) {
        setMessage(d.message)
        setContent("")
      } else {
        setMessage(d.error || "Gagal mengirim komentar")
      }
    } catch {
      setMessage("Gagal mengirim komentar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <h3 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
        Komentar ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12 }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama Anda"
            required
            style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, outline: "none" }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Tulis komentar Anda..."
            required
            rows={3}
            maxLength={1000}
            style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            style={{ padding: "8px 20px", borderRadius: 8, background: "linear-gradient(135deg,#E87A1A,#F59E0B)", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", opacity: submitting || !name.trim() || !content.trim() ? 0.5 : 1 }}
          >
            {submitting ? "Mengirim..." : "Kirim"}
          </button>
          {message && <span style={{ fontSize: 12, color: message.includes("berhasil") ? "#34D399" : "#F87171" }}>{message}</span>}
        </div>
      </form>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }}>Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }}>Belum ada komentar. Jadikan yang pertama!</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>{c.name}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", margin: 0, lineHeight: 1.6 }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
