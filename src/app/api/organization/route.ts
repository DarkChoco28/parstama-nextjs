import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { isVisible: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data struktur organisasi" },
      { status: 500 }
    )
  }
}
