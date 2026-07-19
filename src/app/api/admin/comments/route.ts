import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const comments = await prisma.blogComment.findMany({
    orderBy: { createdAt: "desc" },
  })

  const articleIds = [...new Set(comments.map(c => c.articleId))]
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, title: true, slug: true },
  })
  const articleMap = new Map(articles.map(a => [a.id, a]))

  const enriched = comments.map(c => ({
    ...c,
    article: articleMap.get(c.articleId) || null,
  }))

  return NextResponse.json({ comments: enriched })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const { id, isApproved } = body as { id: string; isApproved: boolean }

  if (!id) return NextResponse.json({ error: "Comment ID wajib" }, { status: 400 })

  const comment = await prisma.blogComment.update({
    where: { id },
    data: { isApproved },
  })

  createAuditLog({
    action: isApproved ? "approve_comment" : "reject_comment",
    userEmail: auth.session?.user?.email || "admin",
    details: `Comment by ${comment.name}: ${isApproved ? "approved" : "rejected"}`,
  })

  return NextResponse.json({ message: isApproved ? "Komentar disetujui" : "Komentar ditolak" })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const { id } = body as { id: string }

  if (!id) return NextResponse.json({ error: "Comment ID wajib" }, { status: 400 })

  const comment = await prisma.blogComment.delete({ where: { id } })

  createAuditLog({
    action: "delete_comment",
    userEmail: auth.session?.user?.email || "admin",
    details: `Deleted comment by ${comment.name}`,
  })

  return NextResponse.json({ message: "Komentar dihapus" })
}
