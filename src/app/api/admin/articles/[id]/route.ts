import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })
    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Gagal mengambil artikel" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { title, excerpt, content, coverImage, author, category, isPublished } = body

    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

    const data: any = {}
    if (title !== undefined) { data.title = title.trim(); data.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
    if (excerpt !== undefined) data.excerpt = excerpt?.trim() || null
    if (content !== undefined) data.content = content.trim()
    if (coverImage !== undefined) data.coverImage = coverImage?.trim() || null
    if (author !== undefined) data.author = author?.trim() || "Admin PARSTAMA"
    if (category !== undefined) data.category = category
    if (isPublished !== undefined) data.isPublished = isPublished

    const article = await prisma.article.update({ where: { id }, data })
    return NextResponse.json(article)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Gagal mengupdate artikel" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    await prisma.article.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 })
  }
}
