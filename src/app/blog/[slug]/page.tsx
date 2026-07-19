import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import BlogComments from "@/components/blog/BlogComments"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, isPublished: true },
  })
  return article
}

async function getRelatedArticles(category: string, currentSlug: string) {
  return prisma.article.findMany({
    where: { isPublished: true, category, slug: { not: currentSlug } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { title: true, slug: true, excerpt: true, category: true, createdAt: true },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Artikel Tidak Ditemukan" }

  const description = article.excerpt || article.title
  const url = `https://parstama.my.id/blog/${article.slug}`

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "PARSTAMA SMKN 1 Singosari",
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author],
      ...(article.coverImage && { images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(article.coverImage && { images: [article.coverImage] }),
    },
    alternates: { canonical: url },
  }
}

const categoryColors: Record<string, string> = { Kesehatan: "#10B981", P3K: "#F59E0B", Kegiatan: "#E87A1A", Lainnya: "#8B5CF6" }

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.category, article.slug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: "PARSTAMA SMKN 1 Singosari" },
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    ...(article.coverImage && { image: article.coverImage }),
    url: `https://parstama.my.id/blog/${article.slug}`,
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage} alt={article.title} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 16, marginBottom: 24 }} loading="lazy" />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${categoryColors[article.category] || "#8B5CF6"}15`, color: categoryColors[article.category] || "#8B5CF6", border: `1px solid ${categoryColors[article.category] || "#8B5CF6"}30` }}>{article.category}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{article.viewCount} views</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>{article.title}</h1>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 32, flexWrap: "wrap" }}>
          <span>{article.author}</span>
          <span>{new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        {article.excerpt && <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", marginBottom: 24, fontStyle: "italic", lineHeight: 1.6 }}>{article.excerpt}</p>}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

        <BlogComments articleSlug={article.slug} />

        {related.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <h3 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Artikel Terkait</h3>
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
      </main>
    </div>
  )
}
