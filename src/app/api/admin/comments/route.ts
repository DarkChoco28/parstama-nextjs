import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const comments = await prisma.blogComment.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        replies: { select: { id: true } },
      },
    })

    const articleIds = [...new Set(comments.map(c => c.articleId))]
    const articles = articleIds.length > 0
      ? await prisma.article.findMany({
          where: { id: { in: articleIds } },
          select: { id: true, title: true, slug: true },
        })
      : []
    const articleMap = new Map(articles.map(a => [a.id, a]))

    const enriched = comments.map(c => ({
      ...c,
      article: articleMap.get(c.articleId) || null,
    }))

    return NextResponse.json({ comments: enriched })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ comments: [] })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { id, isPinned } = body as { id: string; isPinned: boolean }

    if (!id) return NextResponse.json({ error: "Comment ID wajib" }, { status: 400 })

    const comment = await prisma.blogComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 })

    const updated = await prisma.blogComment.update({
      where: { id },
      data: { isPinned },
    })

    createAuditLog({
      action: isPinned ? "pin_comment" : "unpin_comment",
      userEmail: auth.session?.user?.email || "admin",
      details: `${isPinned ? "Pinned" : "Unpinned"} comment by ${comment.name}`,
    })

    return NextResponse.json({ message: isPinned ? "Komentar dipinned" : "Komentar di-unpin", comment: updated })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Gagal mengupdate komentar" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { id } = body as { id: string }

    if (!id) return NextResponse.json({ error: "Comment ID wajib" }, { status: 400 })

    const comment = await prisma.blogComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 })

    await prisma.blogComment.delete({ where: { id } })

    createAuditLog({
      action: "delete_comment",
      userEmail: auth.session?.user?.email || "admin",
      details: `Deleted comment by ${comment.name}: "${comment.content.slice(0, 50)}"`,
    })

    return NextResponse.json({ message: "Komentar dihapus" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Gagal menghapus komentar" }, { status: 500 })
  }
}
