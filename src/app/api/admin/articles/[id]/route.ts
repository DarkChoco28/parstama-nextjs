import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"
import { reindexWebsite } from "@/lib/rag-indexer"

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

    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) {
      if (!body.title.trim()) return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 })
      data.title = body.title.trim()
      data.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }
    if (body.content !== undefined) {
      if (!body.content.trim()) return NextResponse.json({ error: "Konten wajib diisi" }, { status: 400 })
      data.content = body.content.trim()
    }
    if (body.excerpt !== undefined) data.excerpt = body.excerpt?.trim() || null
    if (body.coverImage !== undefined) data.coverImage = body.coverImage?.trim() || null
    if (body.author !== undefined) data.author = body.author?.trim() || "Admin PARSTAMA"
    if (body.category !== undefined) data.category = body.category
    if (body.isPublished !== undefined) data.isPublished = body.isPublished

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 })
    }

    const article = await prisma.article.update({ where: { id }, data })
    createAuditLog({
      action: "update_article",
      userEmail: auth.session?.user?.email || "unknown",
      details: `Mengupdate artikel: "${existing.title}" → "${article.title}"`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })
    reindexWebsite().catch(console.error)
    return NextResponse.json(article)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Gagal mengupdate artikel" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

    await prisma.article.delete({ where: { id } })
    createAuditLog({
      action: "delete_article",
      userEmail: auth.session?.user?.email || "unknown",
      details: `Menghapus artikel: "${existing.title}"`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })
    reindexWebsite().catch(console.error)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 })
  }
}
