import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } })
  if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

  const comments = await prisma.blogComment.findMany({
    where: { articleId: article.id, isApproved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, content: true, createdAt: true },
  })

  return NextResponse.json({ comments })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const rl = await checkRateLimit(`comment:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak komentar. Coba lagi dalam 1 jam." }, { status: 429 })
  }

  const { slug } = await params
  const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } })
  if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

  const body = await request.json()
  const { name, content } = body as { name: string; content: string }

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nama dan komentar wajib diisi" }, { status: 400 })
  }
  if (content.trim().length < 3) {
    return NextResponse.json({ error: "Komentar minimal 3 karakter" }, { status: 400 })
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Komentar maksimal 1000 karakter" }, { status: 400 })
  }

  const comment = await prisma.blogComment.create({
    data: { articleId: article.id, name: name.trim(), content: content.trim() },
    select: { id: true, name: true, content: true, createdAt: true },
  })

  return NextResponse.json({ message: "Komentar berhasil dikirim dan menunggu persetujuan.", comment }, { status: 201 })
}
