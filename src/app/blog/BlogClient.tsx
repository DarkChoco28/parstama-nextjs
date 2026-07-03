"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

interface Article {
  id: string; title: string; slug: string; excerpt?: string; coverImage?: string; author: string; category: string; viewCount: number; createdAt: string
}

const categories = ["", "Kesehatan", "P3K", "Kegiatan", "Lainnya"]
const categoryColors: Record<string, string> = { Kesehatan: "#10B981", P3K: "#F59E0B", Kegiatan: "#E87A1A", Lainnya: "#8B5CF6" }

export default function BlogClient({ initialArticles, initialTotalPages, initialTotal }: { initialArticles: Article[]; initialTotalPages: number; initialTotal: number }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalResults, setTotalResults] = useState(initialTotal)
  const [category, setCategory] = useState("")

  const fetchArticles = useCallback(async (p: number, c: string) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p.toString(), limit: "12" })
    if (c) params.append("category", c)
    try {
      const r = await fetch(`/api/articles?${params}`)
      const d = await r.json()
      setArticles(d.articles || [])
      setTotalPages(d.pagination?.totalPages || 1)
      setTotalResults(d.pagination?.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (page !== 1 || category !== "") fetchArticles(page, category)
  }, [page, category, fetchArticles])

  const handleCategory = (c: string) => { setCategory(c); setPage(1); fetchArticles(1, c) }

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          Blog & <span style={{ background: "linear-gradient(90deg,#F59E0B,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Artikel</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>{totalResults} artikel tentang kesehatan dan kegiatan PMR</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button key={c || "all"} onClick={() => handleCategory(c)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s", background: category === c ? "rgba(232,122,26,.15)" : "rgba(255,255,255,.05)", color: category === c ? "#F59E0B" : "rgba(255,255,255,.5)", border: `1px solid ${category === c ? "rgba(232,122,26,.3)" : "rgba(255,255,255,.08)"}` }}>
            {c || "Semua"}
          </button>
        ))}
      </div>

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
                  <Image src={a.coverImage} alt={a.title} width={400} height={180} unoptimized className="blog-cover" />
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          <button onClick={() => { setLoading(true); setPage(p => Math.max(p - 1, 1)) }} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 12, cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>Sebelumnya</button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center" }}>{page}/{totalPages}</span>
          <button onClick={() => { setLoading(true); setPage(p => Math.min(p + 1, totalPages)) }} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", fontSize: 12, cursor: "pointer", opacity: page === totalPages ? 0.3 : 1 }}>Selanjutnya</button>
        </div>
      )}
    </>
  )
}
