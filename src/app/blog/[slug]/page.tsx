"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Article {
  id: string; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; author: string; category: string; viewCount: number; createdAt: string; updatedAt: string
}

const categoryColors: Record<string, string> = { Kesehatan: "#10B981", P3K: "#F59E0B", Kegiatan: "#E87A1A", Lainnya: "#8B5CF6" }

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!slug) return
    fetch(`/api/articles/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setArticle(d)
        // Fetch related articles from same category
        if (d?.category) {
          fetch(`/api/articles?category=${encodeURIComponent(d.category)}`)
            .then(r => r.json())
            .then(list => {
              const filtered = (list.articles || []).filter((a: Article) => a.slug !== d.slug).slice(0, 3)
              setRelated(filtered)
            })
            .catch(() => {})
        }
      })
      .catch(() => setError("Artikel tidak ditemukan"))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <style>{`
        .article-content { color: rgba(255,255,255,.7); font-size: 15px; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
        .article-content p { margin-bottom: 16px; }
      `}</style>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(10,10,11,.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>
            ← Kembali ke Blog
          </Link>
          <Link href="/" style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>PARSTAMA</Link>
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 64px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}>Memuat artikel...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}>{error}</div>
        ) : article && (
          <>
            {article.coverImage && (
              <img src={article.coverImage} alt={article.title} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 16, marginBottom: 24 }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${categoryColors[article.category] || "#8B5CF6"}15`, color: categoryColors[article.category] || "#8B5CF6", border: `1px solid ${categoryColors[article.category] || "#8B5CF6"}30` }}>{article.category}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{article.viewCount} views</span>
            </div>
            <h1 style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>{article.title}</h1>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 32, flexWrap: "wrap" }}>
              <span>✍️ {article.author}</span>
              <span>{new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            {article.excerpt && <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", marginBottom: 24, fontStyle: "italic", lineHeight: 1.6 }}>{article.excerpt}</p>}
            <div className="article-content">{article.content}</div>

            {/* Artikel Terkait */}
            {related.length > 0 && (
              <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <h3 style={{ fontFamily: "Sansita, Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Artikel Terkait</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {related.map(r => (
                    <Link key={r.slug} href={`/blog/${r.slug}`} style={{ display: "block", padding: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, textDecoration: "none", transition: "border-color .2s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,122,26,.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.06)")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${categoryColors[r.category] || "#8B5CF6"}15`, color: categoryColors[r.category] || "#8B5CF6" }}>{r.category}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{r.title}</h4>
                      {r.excerpt && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
