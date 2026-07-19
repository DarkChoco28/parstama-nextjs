import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = { isPublished: true }
    if (category) where.category = category
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
        { content: { contains: search.trim(), mode: "insensitive" } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, category: true, viewCount: true, createdAt: true },
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({ articles, pagination: { page, totalPages: Math.ceil(total / limit), total } })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Gagal mengambil artikel" }, { status: 500 })
  }
}
