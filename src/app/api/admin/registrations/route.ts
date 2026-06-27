import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import type { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const classFilter = searchParams.get("class")
    const major = searchParams.get("major")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: Prisma.RegistrationWhereInput = {}

    if (status) {
      where.status = status
    }

    if (search?.trim()) {
      const q = search.trim()
      where.OR = [
        { fullName: { contains: q } },
        { whatsapp: { contains: q } },
        { nickname: { contains: q } },
      ]
    }

    if (classFilter?.trim()) {
      where.class = classFilter.trim()
    }

    if (major?.trim()) {
      where.major = major.trim()
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ])

    // Get unique filter options
    const [classes, majors] = await Promise.all([
      prisma.registration.findMany({
        select: { class: true },
        distinct: ["class"],
        orderBy: { class: "asc" },
      }),
      prisma.registration.findMany({
        select: { major: true },
        distinct: ["major"],
        orderBy: { major: "asc" },
      }),
    ])

    return NextResponse.json({
      registrations,
      filters: {
        classes: classes.map((c) => c.class),
        majors: majors.map((m) => m.major),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pendaftaran" },
      { status: 500 }
    )
  }
}
