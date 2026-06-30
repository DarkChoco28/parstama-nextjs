"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface Article {
  id: string; title: string; slug: string; excerpt?: string; coverImage?: string; author: string; category: string; viewCount: number; createdAt: string
}

const categories = ["", "Kesehatan", "P3K", "Kegiatan", "Lainnya"]

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [category, setCategory] = useState("")

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "12" })
      if (category) params.append("category", category)
      const r = await fetch(`/api/articles?${params}`)
      const d = await r.json()
      setArticles(d.articles || [])
      setTotalPages(d.pagination?.totalPages || 1)
      setTotalResults(d.pagination?.total || 0)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [page, category])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const categoryColors: Record<string, string> = { Kesehatan: "#10B981", P3K: "#F59E0B", Kegiatan: "#E87A1A", Lainnya: "#8B5CF6" }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <style>{`
        .blog-card { background: rgba(26,26,28,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; transition: all .3s cubic-bezier(.33,1,.68,1); cursor: pointer; }
        .blog-card:hover { border-color: rgba(232,122,26,.3); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
        .blog-card:hover .blog-card-title { color: #F59E0B; }
        .blog-cover { width: 100%; height: 180px; object-fit: cover; background: rgba(255,255,255,.03); }
        .blog-tag { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(10,10,11,.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/parstama_logo.png" alt="PARSTAMA" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#F59E0B,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARSTAMA</span>
          </Link>
          <Link href="/" style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>← Kembali</Link>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Blog & <span style={{ background: "linear-gradient(90deg,#F59E0B,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Artikel</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>{totalResults} artikel tentang kesehatan dan kegiatan PMR</p>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c || "all"} onClick={() => { setCategory(c); setPage(1) }} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s", background: category === c ? "rgba(232,122,26,.15)" : "rgba(255,255,255,.05)", color: category === c ? "#F59E0B" : "rgba(255,255,255,.5)", border: `1px solid ${category === c ? "rgba(232,122,26,.3)" : "rgba(255,255,255,.08)"}` }}>
              {c || "Semua"}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}>Memuat artikel...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}>Belum ada artikel</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {articles.map(a => (
              <Link key={a.id} href={`/blog/${a.slug}`} style={{ textDecoration: "none" }}>
                <div className="blog-card">
                  {a.coverImage ? (
                    <img src={a.coverImage} alt={a.title} className="blog-cover" />
                  ) : (
                    <div className="blog-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.1 }}>📝</div>
                  )}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span className="blog-tag" style={{ background: `${categoryColors[a.category] || "#8B5CF6"}15`, color: categoryColors[a.category] || "#8B5CF6", border: `1px solid ${categoryColors[a.category] || "#8B5CF6"}30` }}>{a.category}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{a.viewCount} views</span>
                    </div>
                    <h3 className="blog-card-title" style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px", transition: "color .2s", lineHeight: 1.3 }}>{a.title}</h3>
                    {a.excerpt && <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.excerpt}</p>}
                    <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,.3)", display: "flex", justifyContent: "space-between" }}>
                      <span>{a.author}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 12, cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>Sebelumnya</button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center" }}>{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 12, cursor: "pointer", opacity: page === totalPages ? 0.3 : 1 }}>Selanjutnya</button>
          </div>
        )}
      </main>
    </div>
  )
}
