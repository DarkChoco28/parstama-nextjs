"use client"

import { useEffect, useState, useCallback } from "react"

interface Reply {
  id: string; name: string; content: string; userToken: string | null
  likesCount: number; createdAt: string; updatedAt: string
}

interface Comment {
  id: string; name: string; content: string; userToken: string | null
  likesCount: number; isPinned: boolean; createdAt: string; updatedAt: string; replies: Reply[]
}

function getUserToken(): string {
  if (typeof window === "undefined") return ""
  let t = localStorage.getItem("cmt_token")
  if (!t) { t = crypto.randomUUID(); localStorage.setItem("cmt_token", t) }
  return t
}

function getInitialName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("cmt_name") || ""
}

function timeAgo(s: string): string {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 1000)
  if (d < 60) return "Baru saja"
  if (d < 3600) return `${Math.floor(d / 60)}m`
  if (d < 86400) return `${Math.floor(d / 3600)}j`
  if (d < 2592000) return `${Math.floor(d / 86400)}h`
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function Avatar({ name, size = 32, gradient = false }: { name: string; size?: number; gradient?: boolean }) {
  const colors = ["#6366F1,#8B5CF6", "#EC4899,#F472B6", "#10B981,#34D399", "#F59E0B,#FBBF24", "#3B82F6,#60A5FA", "#EF4444,#F87171"]
  const idx = name.charCodeAt(0) % colors.length
  const [c1, c2] = colors[idx].split(",")
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: gradient ? `linear-gradient(135deg,${c1},${c2})` : c1,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#fff",
    }}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function BlogComments({ articleSlug }: { articleSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState(() => getInitialName())
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userToken, setUserToken] = useState(() => getUserToken())
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [hasSetName, setHasSetName] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("cmt_name"))

  const fetchComments = useCallback(async () => {
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`)
      const d = await r.json()
      if (r.ok) {
        setComments(d.comments || [])
        if (userToken) {
          const liked = new Set<string>()
          for (const c of d.comments || []) {
            for (const reply of c.replies || []) {
              if (reply.userToken === userToken) liked.add(reply.id)
            }
          }
          setLikedIds(liked)
        }
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }, [articleSlug, userToken])

  useEffect(() => {
    fetch(`/api/articles/${articleSlug}/comments`)
      .then(r => r.json())
      .then(d => {
        if (d.comments) {
          setComments(d.comments)
          if (userToken) {
            const liked = new Set<string>()
            for (const c of d.comments) {
              for (const reply of c.replies || []) {
                if (reply.userToken === userToken) liked.add(reply.id)
              }
            }
            setLikedIds(liked)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [articleSlug, userToken])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!name.trim()) { setShowNameInput(true); return }
    setSubmitting(true)
    setError("")
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: content.trim(), userToken }),
      })
      const d = await r.json()
      if (r.ok) {
        if (d.userToken) { setUserToken(d.userToken); localStorage.setItem("cmt_token", d.userToken) }
        localStorage.setItem("cmt_name", name.trim())
        setHasSetName(true)
        setContent(""); setError(""); fetchComments()
      } else { setError(d.error || "Gagal mengirim komentar") }
    } catch { setError("Gagal mengirim komentar. Coba lagi.") } finally { setSubmitting(false) }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    if (!name.trim()) { setShowNameInput(true); return }
    setSubmittingReply(true)
    setError("")
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: replyContent.trim(), parentId, userToken }),
      })
      const d = await r.json()
      if (r.ok) {
        if (d.userToken) { setUserToken(d.userToken); localStorage.setItem("cmt_token", d.userToken) }
        localStorage.setItem("cmt_name", name.trim())
        setHasSetName(true)
        setReplyContent(""); setReplyTo(null); fetchComments()
      } else { setError(d.error || "Gagal mengirim balasan") }
    } catch { setError("Gagal mengirim balasan") } finally { setSubmittingReply(false) }
  }

  const handleLike = async (commentId: string) => {
    if (!userToken) return
    const wasLiked = likedIds.has(commentId)
    if (!wasLiked) {
      setAnimatingHearts(prev => new Set(prev).add(commentId))
      setTimeout(() => setAnimatingHearts(prev => { const n = new Set(prev); n.delete(commentId); return n }), 400)
    }
    setLikedIds(prev => { const n = new Set(prev); if (wasLiked) n.delete(commentId); else n.add(commentId); return n })
    setComments(prev => prev.map(c => {
      if (c.id === commentId) return { ...c, likesCount: c.likesCount + (wasLiked ? -1 : 1) }
      return { ...c, replies: c.replies.map(r => r.id === commentId ? { ...r, likesCount: r.likesCount + (wasLiked ? -1 : 1) } : r) }
    }))
    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken }),
      })
    } catch { /* revert on error */ setLikedIds(prev => { const n = new Set(prev); if (wasLiked) n.add(commentId); else n.delete(commentId); return n }) }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, userToken }),
      })
      if (r.ok) fetchComments()
    } catch { /* empty */ }
  }

  const totalComments = comments.reduce((a, c) => a + 1 + (c.replies?.length || 0), 0)

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <h3 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
          Komentar
        </h3>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>({totalComments})</span>
      </div>

      {/* Input box - kayak Instagram */}
      <div style={{
        background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <form onSubmit={handlePost}>
          <div style={{ display: "flex", gap: 10 }}>
            <Avatar name={name || "?"} size={36} />
            <div style={{ flex: 1 }}>
              {hasSetName && !showNameInput && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{name}</span>
                  <button type="button" onClick={() => { setShowNameInput(true); setHasSetName(false) }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", fontSize: 11, fontFamily: "inherit" }}>
                    Ganti
                  </button>
                </div>
              )}
              {!hasSetName && showNameInput && (
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  onBlur={() => { if (name.trim()) { localStorage.setItem("cmt_name", name.trim()); setHasSetName(true); setShowNameInput(false) } }}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (name.trim()) { localStorage.setItem("cmt_name", name.trim()); setHasSetName(true); setShowNameInput(false) } } }}
                  placeholder="Nama Anda"
                  autoFocus
                  style={{
                    width: "100%", padding: "8px 12px", marginBottom: 8,
                    borderRadius: 8, background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)", color: "#fff",
                    fontSize: 13, outline: "none", fontFamily: "inherit",
                  }}
                />
              )}
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                placeholder={name.trim() ? "Tambahkan komentar..." : "Masukkan nama dulu..."}
                rows={2}
                onClick={() => { if (!name.trim()) setShowNameInput(true) }}
                style={{
                  width: "100%", padding: "10px 12px",
                  borderRadius: 10, background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.08)", color: "#fff",
                  fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5,
                  fontFamily: "inherit", minHeight: 44,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 8 }}>
                <button type="submit" disabled={submitting || !content.trim()} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: content.trim() && name.trim() ? "linear-gradient(135deg,#E87A1A,#F97316)" : "rgba(255,255,255,.08)",
                  color: content.trim() && name.trim() ? "#fff" : "rgba(255,255,255,.25)",
                  fontSize: 13, fontWeight: 700, cursor: content.trim() && name.trim() ? "pointer" : "default",
                  fontFamily: "inherit",
                }}>
                  {submitting ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </div>
          </div>
        </form>
        {error && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#F87171", fontSize: 12 }}>
            {error}
          </div>
        )}
      </div>

      {/* Komentar list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,.1)", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 14, margin: 0 }}>Belum ada komentar</p>
          <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, margin: "4px 0 0" }}>Jadikan yang pertama!</p>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <div key={comment.id} style={{ marginBottom: 4 }}>
              {/* Komentar utama */}
              <div style={{ display: "flex", gap: 10, padding: "10px 0" }}>
                <Avatar name={comment.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: "#fff", marginRight: 6 }}>{comment.name}</span>
                    {comment.isPinned && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#FBBF24", background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 6, padding: "1px 6px", marginRight: 6, verticalAlign: "middle" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22"/><path d="M5 12H2"/><path d="M22 12h-3"/></svg>
                        PINNED
                      </span>
                    )}
                    <span style={{ color: "rgba(255,255,255,.7)" }}>{comment.content}</span>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{timeAgo(comment.createdAt)}</span>
                    <button
                      onClick={() => handleLike(comment.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "none", border: "none", cursor: "pointer", padding: "2px 0",
                        fontFamily: "inherit",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={likedIds.has(comment.id) ? "#EF4444" : "none"} stroke={likedIds.has(comment.id) ? "#EF4444" : "rgba(255,255,255,.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .15s", transform: animatingHearts.has(comment.id) ? "scale(1.3)" : "scale(1)" }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {comment.likesCount > 0 && <span style={{ fontSize: 12, color: likedIds.has(comment.id) ? "#EF4444" : "rgba(255,255,255,.35)" }}>{comment.likesCount}</span>}
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                        fontSize: 12, color: "rgba(255,255,255,.3)", fontWeight: 500, fontFamily: "inherit",
                      }}
                    >
                      Balas
                    </button>
                    {comment.userToken === userToken && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          fontSize: 11, color: "rgba(239,68,68,.4)", fontFamily: "inherit",
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Reply input */}
                  {replyTo === comment.id && (
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      <Avatar name={name || "?"} size={24} />
                      <input
                        type="text" value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder={`Balas ${comment.name}...`}
                        autoFocus
                        onKeyDown={e => { if (e.key === "Enter" && replyContent.trim()) handleReply(comment.id) }}
                        style={{
                          flex: 1, padding: "8px 12px", borderRadius: 20,
                          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                          color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit",
                        }}
                      />
                      {replyContent.trim() && (
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={submittingReply}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#F97316", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                          }}
                        >
                          {submittingReply ? "..." : "Kirim"}
                        </button>
                      )}
                      <button
                        onClick={() => { setReplyTo(null); setReplyContent("") }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", fontSize: 12, fontFamily: "inherit" }}
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: 42 }}>
                  {comment.replies.map(reply => (
                    <div key={reply.id} style={{ display: "flex", gap: 8, padding: "6px 0" }}>
                      <Avatar name={reply.name} size={22} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: "#fff", marginRight: 4 }}>{reply.name}</span>
                          <span style={{ color: "rgba(255,255,255,.6)" }}>{reply.content}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)" }}>{timeAgo(reply.createdAt)}</span>
                          <button
                            onClick={() => handleLike(reply.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 3,
                              background: "none", border: "none", cursor: "pointer", padding: "2px 0",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={likedIds.has(reply.id) ? "#EF4444" : "none"} stroke={likedIds.has(reply.id) ? "#EF4444" : "rgba(255,255,255,.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .15s", transform: animatingHearts.has(reply.id) ? "scale(1.3)" : "scale(1)" }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            {reply.likesCount > 0 && <span style={{ fontSize: 11, color: likedIds.has(reply.id) ? "#EF4444" : "rgba(255,255,255,.3)" }}>{reply.likesCount}</span>}
                          </button>
                          {reply.userToken === userToken && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 10, color: "rgba(239,68,68,.35)", fontFamily: "inherit" }}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
