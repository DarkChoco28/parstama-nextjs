import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"
import { settingsSchema } from "@/lib/validation"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "registration_open" },
    })

    return NextResponse.json({ value: setting?.value || "1" })
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil status pendaftaran" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { value } = parsed.data

    const setting = await prisma.setting.upsert({
      where: { key: "registration_open" },
      update: { value },
      create: { key: "registration_open", value },
    })

    createAuditLog({
      action: `toggle_registration:${value === "1" ? "open" : "closed"}`,
      userEmail: auth.session?.user?.email || "unknown",
      details: value === "1" ? "Membuka pendaftaran" : "Menutup pendaftaran",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    })

    return NextResponse.json({ value: setting.value })
  } catch (error) {
    console.error("Error updating registration status:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengubah status pendaftaran" },
      { status: 500 }
    )
  }
}
