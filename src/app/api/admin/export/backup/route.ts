import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const [registrations, articles, events, members, settings] = await Promise.all([
      prisma.registration.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.event.findMany({ orderBy: { startDate: "desc" } }),
      prisma.organizationMember.findMany({ orderBy: [{ level: "asc" }, { sortOrder: "asc" }] }),
      prisma.setting.findMany(),
    ])

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      counts: { registrations: registrations.length, articles: articles.length, events: events.length, members: members.length, settings: settings.length },
      data: { registrations, articles, events, members, settings },
    }

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="parstama-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Gagal membuat backup" }, { status: 500 })
  }
}
