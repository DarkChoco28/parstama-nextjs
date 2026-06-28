import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { jsPDF } from "jspdf"
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

    const where: Prisma.RegistrationWhereInput = {}

    if (status) where.status = status
    if (search?.trim()) {
      const q = search.trim()
      where.OR = [
        { fullName: { contains: q } },
        { whatsapp: { contains: q } },
        { nickname: { contains: q } },
        { email: { contains: q } },
      ]
    }
    if (classFilter?.trim()) where.class = classFilter.trim()
    if (major?.trim()) where.major = major.trim()
    if (gender && ["L", "P"].includes(gender)) where.gender = gender
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

    // Card dimensions (ID card size)
    const cardW = 86
    const cardH = 54
    const marginX = 7.5
    const marginY = 10
    const gapX = 5
    const gapY = 5
    const cols = 3
    const rows = 3
    const perPage = cols * rows

    registrations.forEach((reg, i) => {
      const posInPage = i % perPage
      if (posInPage === 0 && i > 0) doc.addPage()

      const col = posInPage % cols
      const row = Math.floor(posInPage / cols)
      const x = marginX + col * (cardW + gapX)
      const y = marginY + row * (cardH + gapY)

      // Card background
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(x, y, cardW, cardH, 3, 3, "F")

      // Card border
      doc.setDrawColor(200, 200, 200)
      doc.roundedRect(x, y, cardW, cardH, 3, 3, "S")

      // Red header bar
      doc.setFillColor(220, 38, 38)
      doc.rect(x, y, cardW, 10, "F")

      // Header text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("PARSTAMA", x + cardW / 2, y + 6.5, { align: "center" })

      // Photo placeholder
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(x + 4, y + 13, 14, 14, 1, 1, "F")
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(5)
      doc.text("FOTO", x + 11, y + 21, { align: "center" })

      // Info fields
      const infoX = x + 22
      const infoW = cardW - 26
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(6.5)
      doc.setFont("helvetica", "bold")

      const fields = [
        { label: "Nama", value: reg.fullName },
        { label: "JK", value: reg.gender === "L" ? "Laki-laki" : "Perempuan" },
        { label: "Kelas", value: `${reg.class} - ${reg.major}` },
        { label: "Lahir", value: reg.birthDate ? new Date(reg.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-" },
      ]

      fields.forEach((f, fi) => {
        const fy = y + 16 + fi * 4.5
        doc.setFont("helvetica", "bold")
        doc.text(`${f.label}:`, infoX, fy)
        doc.setFont("helvetica", "normal")
        const value = f.value.length > 28 ? f.value.substring(0, 25) + "..." : f.value
        doc.text(value, infoX + 18, fy)
      })

      // Contact info
      const contactY = y + 36
      doc.setFontSize(5.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(`WA: ${reg.whatsapp}`, x + 4, contactY)
      if (reg.email) {
        const emailText = reg.email.length > 30 ? reg.email.substring(0, 27) + "..." : reg.email
        doc.text(`Email: ${emailText}`, x + 4, contactY + 4)
      }

      // Status badge
      const statusY = y + cardH - 8
      let statusColor: [number, number, number] = [252, 211, 77]
      let statusText = "Pending"
      if (reg.status === "accepted") {
        statusColor = [52, 211, 153]
        statusText = "Diterima"
      } else if (reg.status === "rejected") {
        statusColor = [239, 68, 68]
        statusText = "Ditolak"
      }

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      doc.roundedRect(x + cardW - 28, statusY, 24, 6, 2, 2, "F")
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(5.5)
      doc.setFont("helvetica", "bold")
      doc.text(statusText, x + cardW - 16, statusY + 4, { align: "center" })
    })

    // If no registrations, add at least one page
    if (registrations.length === 0) {
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(marginX, marginY, cardW, cardH, 3, 3, "F")
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.text("Tidak ada data", marginX + cardW / 2, marginY + cardH / 2, { align: "center" })
    }

    const buffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="id-card-pmr-parstama-filtered-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error exporting filtered PDF:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat export PDF" },
      { status: 500 }
    )
  }
}
