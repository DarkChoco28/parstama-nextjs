"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  name: string
  content: string
  likesCount: number
  isPinned: boolean
  createdAt: string
  articleId: string
  parentId: string | null
  article?: { id: string; title: string; slug: string } | null
  replies?: { id: string }[]
}

export default function AdminComments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchComments = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/comments")
      const d = await r.json()
      setComments(d.comments || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/comments")
        .then(r => r.json())
        .then(d => setComments(d.comments || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status])

  const togglePin = async (id: string, currentPinned: boolean) => {
    setProcessingId(id)
    try {
      const r = await fetch("/api/admin/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPinned }),
      })
      if (r.ok) fetchComments()
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingId(null)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm("Yakin hapus komentar ini?")) return
    setProcessingId(id)
    try {
      const r = await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (r.ok) fetchComments()
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingId(null)
    }
  }

  const parentComments = comments.filter(c => !c.parentId)
  const totalReplies = comments.filter(c => c.parentId).length
  const totalLikes = comments.reduce((acc, c) => acc + c.likesCount, 0)
  const pinnedCount = parentComments.filter(c => c.isPinned).length

  if (status === "loading" || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>Memuat data komentar...</span>
      </div>
    )
  }
  if (!session) return null

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Komentar Blog</h1>
          <p className="admin-subtitle">Semua komentar dari pengunjung website</p>
        </div>

        <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
          <div className="admin-stat-card" style={{ borderColor: "rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)" }}>
            <div className="admin-stat-label" style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Komentar</div>
            <div className="admin-stat-value" style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>{parentComments.length}</div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: "rgba(96,165,250,.3)", background: "rgba(96,165,250,.05)" }}>
            <div className="admin-stat-label" style={{ color: "rgba(96,165,250,.6)", fontSize: 12 }}>Balasan</div>
            <div className="admin-stat-value" style={{ color: "#60A5FA", fontSize: 24, fontWeight: 700 }}>{totalReplies}</div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: "rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)" }}>
            <div className="admin-stat-label" style={{ color: "rgba(239,68,68,.6)", fontSize: 12 }}>Likes</div>
            <div className="admin-stat-value" style={{ color: "#EF4444", fontSize: 24, fontWeight: 700 }}>{totalLikes}</div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.05)" }}>
            <div className="admin-stat-label" style={{ color: "rgba(251,191,36,.6)", fontSize: 12 }}>Pinned</div>
            <div className="admin-stat-value" style={{ color: "#FBBF24", fontSize: 24, fontWeight: 700 }}>{pinnedCount}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {parentComments.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 13 }}>
              Belum ada komentar
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="reg-desktop-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-th" style={{ width: 40 }}>#</th>
                      <th className="admin-th">Nama</th>
                      <th className="admin-th">Komentar</th>
                      <th className="admin-th">Artikel</th>
                      <th className="admin-th">Balasan</th>
                      <th className="admin-th">Likes</th>
                      <th className="admin-th">Status</th>
                      <th className="admin-th">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentComments.map((c, idx) => (
                      <tr key={c.id} className="admin-tr" style={c.isPinned ? { background: "rgba(251,191,36,.04)" } : undefined}>
                        <td className="admin-td" style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>{idx + 1}</td>
                        <td className="admin-td admin-td-bold">{c.name}</td>
                        <td className="admin-td" style={{ maxWidth: 250 }}>
                          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.content}</div>
                        </td>
                        <td className="admin-td">
                          {c.article ? (
                            <a href={`/blog/${c.article.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA", fontSize: 12, textDecoration: "none" }}>
                              {c.article.title.length > 20 ? c.article.title.slice(0, 20) + "..." : c.article.title}
                            </a>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>-</span>
                          )}
                        </td>
                        <td className="admin-td" style={{ textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 13 }}>
                          {c.replies?.length || 0}
                        </td>
                        <td className="admin-td" style={{ textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 13 }}>
                          {c.likesCount}
                        </td>
                        <td className="admin-td">
                          {c.isPinned && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#FBBF24", background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 6, padding: "2px 8px" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22"/><path d="M5 12H2"/><path d="M22 12h-3"/></svg>
                              PINNED
                            </span>
                          )}
                        </td>
                        <td className="admin-td">
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <a
                              href={`/blog/${c.article?.slug || ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-btn-blue-sm"
                            >
                              Lihat
                            </a>
                            <button
                              onClick={() => togglePin(c.id, c.isPinned)}
                              disabled={processingId === c.id}
                              style={{
                                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                background: c.isPinned ? "rgba(251,191,36,.15)" : "rgba(255,255,255,.05)",
                                color: c.isPinned ? "#FBBF24" : "rgba(255,255,255,.5)",
                                border: `1px solid ${c.isPinned ? "rgba(251,191,36,.3)" : "rgba(255,255,255,.1)"}`,
                                fontFamily: "inherit", transition: "all .2s",
                              }}
                            >
                              {processingId === c.id ? "..." : c.isPinned ? "Unpin" : "Pin"}
                            </button>
                            <button onClick={() => deleteComment(c.id)} disabled={processingId === c.id} className="admin-btn-danger-sm">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="reg-mobile-list">
                {parentComments.map((c, idx) => (
                  <div key={c.id} style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,.06)", background: c.isPinned ? "rgba(251,191,36,.04)" : undefined }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(232,122,26,.6)", background: "rgba(232,122,26,.1)", border: "1px solid rgba(232,122,26,.2)", borderRadius: 6, padding: "2px 7px" }}>{idx + 1}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", flex: 1 }}>{c.name}</span>
                      {c.isPinned && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#FBBF24", background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 6, padding: "2px 8px" }}>
                          PINNED
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                        ❤️ {c.likesCount} · 💬 {c.replies?.length || 0}
                      </span>
                    </div>
                    <div style={{ padding: 12, background: "rgba(255,255,255,.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,.04)", marginBottom: 10 }}>
                      <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, lineHeight: 1.6 }}>{c.content}</div>
                    </div>
                    {c.article && (
                      <div style={{ marginBottom: 10 }}>
                        <a href={`/blog/${c.article.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA", fontSize: 12, textDecoration: "none" }}>
                          Artikel: {c.article.title}
                        </a>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <a
                          href={`/blog/${c.article?.slug || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn-blue-sm"
                        >
                          Lihat
                        </a>
                        <button
                          onClick={() => togglePin(c.id, c.isPinned)}
                          disabled={processingId === c.id}
                          style={{
                            padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            background: c.isPinned ? "rgba(251,191,36,.15)" : "rgba(255,255,255,.05)",
                            color: c.isPinned ? "#FBBF24" : "rgba(255,255,255,.5)",
                            border: `1px solid ${c.isPinned ? "rgba(251,191,36,.3)" : "rgba(255,255,255,.1)"}`,
                            fontFamily: "inherit",
                          }}
                        >
                          {processingId === c.id ? "..." : c.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button onClick={() => deleteComment(c.id)} disabled={processingId === c.id} className="admin-btn-danger-sm">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
