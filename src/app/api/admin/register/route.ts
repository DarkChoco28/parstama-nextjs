import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { name, email, password } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
    }
    if (!password || password.length < 12) {
      return NextResponse.json({ error: "Password minimal 12 karakter" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        isAdmin: true,
        emailVerifiedAt: new Date(),
      },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    return NextResponse.json({ message: "Admin baru berhasil dibuat", user }, { status: 201 })
  } catch (error) {
    console.error("Error registering admin:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
