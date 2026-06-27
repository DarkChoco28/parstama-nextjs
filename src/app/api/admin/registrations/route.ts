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
    const gender = searchParams.get("gender")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
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
        { email: { contains: q } },
      ]
    }

    if (classFilter?.trim()) {
      where.class = classFilter.trim()
    }

    if (major?.trim()) {
      where.major = major.trim()
    }

    if (gender && ["L", "P"].includes(gender)) {
      where.gender = gender
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
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
    const [classes, majors, genders] = await Promise.all([
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
      prisma.registration.findMany({
        select: { gender: true },
        distinct: ["gender"],
      }),
    ])

    return NextResponse.json({
      registrations,
      filters: {
        classes: classes.map((c) => c.class),
        majors: majors.map((m) => m.major),
        genders: genders.map((g) => g.gender),
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
