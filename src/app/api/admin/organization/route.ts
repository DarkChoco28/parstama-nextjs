import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const members = await prisma.organizationMember.findMany({
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data struktur organisasi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { name, nickname, position, photo, level, parentId, sortOrder, period, isVisible } = body

    if (!name?.trim() || !position?.trim()) {
      return NextResponse.json(
        { error: "Nama dan jabatan wajib diisi" },
        { status: 400 }
      )
    }

    const member = await prisma.organizationMember.create({
      data: {
        name: name.trim(),
        nickname: nickname?.trim() || null,
        position: position.trim(),
        photo: photo?.trim() || null,
        level: level ?? 0,
        parentId: parentId?.trim() || null,
        sortOrder: sortOrder ?? 0,
        period: period?.trim() || null,
        isVisible: isVisible ?? true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json(
      { error: "Gagal menambah anggota" },
      { status: 500 }
    )
  }
}
