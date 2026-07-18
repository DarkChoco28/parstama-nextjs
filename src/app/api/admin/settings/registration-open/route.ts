import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "registration_open" },
    })

    return NextResponse.json({ value: setting?.value || "1" })
  } catch (error) {
    console.error("Error fetching registration status:", error)
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
    const { value } = body

    const setting = await prisma.setting.upsert({
      where: { key: "registration_open" },
      update: { value },
      create: { key: "registration_open", value },
    })

    createAuditLog({
      action: "toggle_registration",
      userEmail: auth.session?.user?.email || "admin",
      details: `Registration ${value === "1" ? "opened" : "closed"}`,
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
