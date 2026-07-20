import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } })
    if (!article) return NextResponse.json({ comments: [] })

    const rawComments = await prisma.blogComment.findMany({
      where: { articleId: article.id, parentId: null },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    })

    const comments = rawComments.map(c => ({
      id: c.id, name: c.name, content: c.content, userToken: c.userToken,
      likesCount: c.likesCount, isPinned: c.isPinned, createdAt: c.createdAt, updatedAt: c.updatedAt,
      replies: c.replies.map(r => ({
        id: r.id, name: r.name, content: r.content, userToken: r.userToken,
        likesCount: r.likesCount, createdAt: r.createdAt, updatedAt: r.updatedAt,
      })),
    }))

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } })
    if (!article) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 })

    const body = await request.json()
    const { name, content, parentId, userToken } = body as {
      name: string; content: string; parentId?: string; userToken?: string
    }

    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Nama dan komentar wajib diisi" }, { status: 400 })
    }

    if (parentId) {
      const parentComment = await prisma.blogComment.findUnique({ where: { id: parentId } })
      if (!parentComment || parentComment.articleId !== article.id) {
        return NextResponse.json({ error: "Komentar induk tidak valid" }, { status: 400 })
      }
    }

    const token = userToken || crypto.randomUUID()

    const comment = await prisma.blogComment.create({
      data: {
        articleId: article.id,
        name: name.trim(),
        content: content.trim(),
        parentId: parentId || null,
        userToken: token,
      },
      select: {
        id: true, name: true, content: true, userToken: true,
        likesCount: true, createdAt: true, updatedAt: true,
      },
    })

    return NextResponse.json({ comment, userToken: token }, { status: 201 })
  } catch (error) {
    console.error("Error posting comment:", error)
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Gagal mengirim komentar", detail: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userToken } = body as { id: string; userToken: string }

    if (!id || !userToken) {
      return NextResponse.json({ error: "ID dan user token wajib" }, { status: 400 })
    }

    const comment = await prisma.blogComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 })
    if (comment.userToken !== userToken) {
      return NextResponse.json({ error: "Tidak bisa menghapus komentar orang lain" }, { status: 403 })
    }

    await prisma.blogComment.delete({ where: { id } })
    return NextResponse.json({ message: "Komentar dihapus" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Gagal menghapus komentar" }, { status: 500 })
  }
}
