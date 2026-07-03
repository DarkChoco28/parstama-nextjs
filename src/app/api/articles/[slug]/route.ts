import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed } = await checkRateLimit(`article-view:${ip}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 })
  }
  try {
    const { slug } = await params
    const article = await prisma.article.findUnique({
      where: { slug, isPublished: true },
      select: { id: true, title: true, slug: true, excerpt: true, content: true, coverImage: true, author: true, category: true, viewCount: true, createdAt: true, updatedAt: true },
    })

    if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

    await prisma.article.update({ where: { slug }, data: { viewCount: { increment: 1 } } })

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Gagal mengambil artikel" }, { status: 500 })
  }
}
