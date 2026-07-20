import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userToken } = body as { userToken: string }

    if (!userToken) {
      return NextResponse.json({ error: "User token wajib" }, { status: 400 })
    }

    const comment = await prisma.blogComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 })

    const existingLike = await prisma.commentLike.findUnique({
      where: { commentId_userToken: { commentId: id, userToken } },
    })

    if (existingLike) {
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { id: existingLike.id } }),
        prisma.blogComment.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
      ])
      return NextResponse.json({ liked: false, likesCount: Math.max(0, comment.likesCount - 1) })
    } else {
      await prisma.$transaction([
        prisma.commentLike.create({ data: { commentId: id, userToken } }),
        prisma.blogComment.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
      ])
      return NextResponse.json({ liked: true, likesCount: comment.likesCount + 1 })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Gagal memproses like" }, { status: 500 })
  }
}
