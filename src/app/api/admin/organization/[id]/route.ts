import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { name, nickname, position, photo, level, parentId, sortOrder, period, isVisible } = body

    const member = await prisma.organizationMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(nickname !== undefined && { nickname: nickname?.trim() || null }),
        ...(position !== undefined && { position: position.trim() }),
        ...(photo !== undefined && { photo: photo?.trim() || null }),
        ...(level !== undefined && { level }),
        ...(parentId !== undefined && { parentId: parentId?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(period !== undefined && { period: period?.trim() || null }),
        ...(isVisible !== undefined && { isVisible }),
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate anggota" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    await prisma.organizationMember.delete({ where: { id } })
    return NextResponse.json({ message: "Berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Gagal menghapus anggota" },
      { status: 500 }
    )
  }
}
