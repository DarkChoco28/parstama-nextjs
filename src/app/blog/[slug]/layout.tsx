import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://parstama.my.id"
    const res = await fetch(`${baseUrl}/api/articles/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const article = await res.json()
      return {
        title: `${article.title} - PARSTAMA`,
        description: article.excerpt || article.content?.slice(0, 160) || "Artikel PARSTAMA",
        openGraph: article.image ? { images: [{ url: article.image }] } : undefined,
      }
    }
  } catch {}

  return {
    title: "Artikel - PARSTAMA",
    description: "Baca artikel kesehatan dan kegiatan PARSTAMA",
  }
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children
}
