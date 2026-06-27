import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const registration = await prisma.registration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pendaftaran" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const registration = await prisma.registration.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate status pendaftaran" },
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
    await prisma.registration.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Pendaftaran berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus pendaftaran" },
      { status: 500 }
    )
  }
}
