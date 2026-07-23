import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  title: "Blog | PARSTAMA SMKN 1 Singosari",
  description: "Artikel terbaru seputar kesehatan, kegiatan, dan informasi Palang Merah Remaja (PMR) PARSTAMA SMKN 1 Singosari.",
  openGraph: {
    title: "Blog | PARSTAMA SMKN 1 Singosari",
    description: "Artikel terbaru seputar kesehatan, kegiatan, dan informasi PARSTAMA.",
    url: "https://parstama.my.id/blog",
    siteName: "PARSTAMA SMKN 1 Singosari",
    type: "website",
  },
  alternates: { canonical: "https://parstama.my.id/blog" },
}

async function getInitialArticles() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/articles?page=1&limit=12`, { cache: "no-store" })
    if (!res.ok) return { articles: [], totalPages: 1, total: 0 }
    const d = await res.json()
    return { articles: d.articles || [], totalPages: d.pagination?.totalPages || 1, total: d.pagination?.total || 0 }
  } catch {
    return { articles: [], totalPages: 1, total: 0 }
  }
}

export default async function BlogPage() {
  const { articles, totalPages, total } = await getInitialArticles()

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <style>{`
        .blog-card { background: rgba(26,26,28,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; transition: all .3s cubic-bezier(.33,1,.68,1); cursor: pointer; }
        .blog-card:hover { border-color: rgba(232,122,26,.3); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
        .blog-card:hover .blog-card-title { color: #F59E0B; }
        .blog-cover { width: 100%; height: 180px; object-fit: cover; background: rgba(255,255,255,.03); }
        .blog-tag { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; }
      `}</style>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(10,10,11,.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} unoptimized className="w-15 h-15 sm:w-16 sm:h-16 rounded-full object-contain" />
            <span style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#F59E0B,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARSTAMA</span>
          </Link>
          <Link href="/" style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>← Kembali</Link>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <BlogClient initialArticles={articles} initialTotalPages={totalPages} initialTotal={total} />
      </main>
    </div>
  )
}
