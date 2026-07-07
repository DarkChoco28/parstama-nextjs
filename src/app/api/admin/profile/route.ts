import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { name, email, currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
    })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    if (name?.trim()) {
      updates.name = name.trim()
    }

    if (email?.trim() && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 })
      }
      updates.email = email.trim()
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Password saat ini wajib diisi untuk mengganti password" }, { status: 400 })
      }
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 })
      }
      updates.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ message: "Profile berhasil diupdate", user: updated })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
