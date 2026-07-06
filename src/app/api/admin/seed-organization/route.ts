import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

const seedData = [
  {
    name: "Ketua Umum",
    nickname: "",
    position: "Ketua Umum",
    bio: "",
    level: 0,
    parentId: null,
    sortOrder: 0,
    period: "2026-2027",
  },
  {
    name: "Ketua Satu",
    nickname: "",
    position: "Ketua Satu",
    bio: "",
    level: 1,
    parentId: "__KETUA_UMUM__",
    sortOrder: 0,
    period: "2026-2027",
  },
  {
    name: "Sekretaris",
    nickname: "",
    position: "Sekretaris",
    bio: "",
    level: 2,
    parentId: "__KETUA_SATU__",
    sortOrder: 0,
    period: "2026-2027",
  },
  {
    name: "Bendahara",
    nickname: "",
    position: "Bendahara",
    bio: "",
    level: 2,
    parentId: "__KETUA_SATU__",
    sortOrder: 1,
    period: "2026-2027",
  },
  {
    name: "Humas Internal",
    nickname: "",
    position: "Humas Internal",
    bio: "",
    level: 3,
    parentId: "__SEKRETARIS__",
    sortOrder: 0,
    period: "2026-2027",
  },
  {
    name: "Humas Eksternal",
    nickname: "",
    position: "Humas Eksternal",
    bio: "",
    level: 3,
    parentId: "__BENDAHARA__",
    sortOrder: 0,
    period: "2026-2027",
  },
]

export async function POST() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    await prisma.organizationMember.deleteMany()

    const placeholders: Record<string, string> = {}
    const created: any[] = []

    for (const d of seedData) {
      let parentId: string | null = null
      if (d.parentId) {
        parentId = placeholders[d.parentId] ?? null
      }

      const member = await prisma.organizationMember.create({
        data: {
          name: d.name,
          nickname: d.nickname || null,
          position: d.position,
          bio: d.bio || null,
          photo: null,
          level: d.level,
          parentId,
          sortOrder: d.sortOrder,
          period: d.period,
          isVisible: true,
        },
      })

      const key = `__${d.position.toUpperCase().replace(/\s+/g, "_")}__`
      placeholders[key] = member.id
      created.push(member)
    }

    createAuditLog({
      action: "seed_organization",
      userEmail: auth.session?.user?.email || "admin",
      details: `Menambahkan ${created.length} anggota organisasi`,
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil seed ${created.length} anggota organisasi`,
    })
  } catch (error) {
    console.error("Seed organization error:", error)
    return NextResponse.json(
      { error: "Gagal seed data organisasi" },
      { status: 500 }
    )
  }
}
