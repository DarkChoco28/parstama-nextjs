import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"
import { articleSchema } from "@/lib/validation"

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""

    const where: any = {}
    if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { excerpt: { contains: search, mode: "insensitive" } }]
    if (category) where.category = category
    if (status === "published") where.isPublished = true
    if (status === "draft") where.isPublished = false

    const [articles, total] = await Promise.all([
      prisma.article.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({ articles, pagination: { page, totalPages: Math.ceil(total / limit), total } })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json({ error: "Gagal mengambil data artikel" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const parsed = articleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { title, excerpt, content, coverImage, author, category, isPublished } = parsed.data

    let slug = toSlug(title)
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        coverImage: coverImage?.trim() || null,
        author: author?.trim() || "Admin PARSTAMA",
        category: category || "Kesehatan",
        isPublished: isPublished ?? false,
      },
    })

    createAuditLog({
      action: "create_article",
      userEmail: auth.session?.user?.email || "unknown",
      details: `Membuat artikel baru: "${title.trim()}"`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 })
  }
}
