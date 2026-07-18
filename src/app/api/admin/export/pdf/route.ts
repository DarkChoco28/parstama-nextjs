import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import jsPDF from "jspdf"

function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: "F" | "FD" | "S" = "FD") {
  doc.roundedRect(x, y, w, h, r, r, style)
}

interface PdfReg { fullName: string; nickname?: string | null; gender: string; class: string; major: string; birthDate?: string | Date | null; whatsapp: string; email?: string | null; status: string; createdAt?: string | Date | null }

function drawCard(doc: jsPDF, reg: PdfReg, x: number, y: number) {
  const cardW = 86
  const cardH = 54

  const red: [number, number, number] = [220, 38, 38]
  const dark: [number, number, number] = [17, 24, 39]
  const white: [number, number, number] = [255, 255, 255]
  const lightGray: [number, number, number] = [243, 244, 246]
  const gray: [number, number, number] = [107, 114, 128]
  const green: [number, number, number] = [16, 185, 129]
  const yellow: [number, number, number] = [245, 158, 11]
  const redBadge: [number, number, number] = [239, 68, 68]

  // Card shadow
  doc.setFillColor(0, 0, 0)
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  roundedRect(doc, x + 0.8, y + 0.8, cardW, cardH, 4, "F")

  // Card background
  doc.setFillColor(...white)
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.4)
  roundedRect(doc, x, y, cardW, cardH, 4, "FD")

  // Red header bar
  doc.setFillColor(...red)
  doc.roundedRect(x, y, cardW, 12, 4, 4, "F")
  doc.rect(x, y + 8, cardW, 4, "F")

  // Header text
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...white)
  doc.text("PARSTAMA", x + cardW / 2, y + 5.5, { align: "center" })
  doc.setFontSize(4.5)
  doc.setFont("helvetica", "normal")
  doc.text("SMKN 1 NEGERI SINGOSARI", x + cardW / 2, y + 9.5, { align: "center" })

  // Photo placeholder
  const photoX = x + 5
  const photoY = y + 15
  const photoW = 18
  const photoH = 22

  doc.setFillColor(...lightGray)
  doc.setDrawColor(...gray)
  doc.setLineWidth(0.3)
  roundedRect(doc, photoX, photoY, photoW, photoH, 2, "FD")

  // Camera icon
  doc.setFillColor(...gray)
  const iconX = photoX + photoW / 2
  const iconY = photoY + photoH / 2 - 1
  doc.roundedRect(iconX - 4, iconY - 2, 8, 6, 1, 1, "FD")
  doc.setFillColor(...white)
  doc.circle(iconX, iconY + 1, 1.5, "F")
  doc.setFillColor(...gray)
  doc.roundedRect(iconX - 1.5, iconY - 3.5, 3, 1.5, 0.5, 0.5, "FD")

  // Info section
  const infoX = photoX + photoW + 4
  const infoW = cardW - photoW - 14

  // Name
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...dark)
  const name = reg.fullName.length > 22 ? reg.fullName.substring(0, 22) + "..." : reg.fullName
  doc.text(name, infoX, y + 17)

  // Nickname
  if (reg.nickname) {
    doc.setFontSize(5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...gray)
    doc.text('"' + reg.nickname + '"', infoX, y + 21)
  }

  // Divider
  doc.setDrawColor(...red)
  doc.setLineWidth(0.3)
  doc.line(infoX, y + 23, infoX + infoW, y + 23)

  // Fields
  const fields = [
    { label: "JK", value: reg.gender === "L" ? "Laki-laki" : "Perempuan" },
    { label: "Kelas", value: reg.class },
    { label: "Jurusan", value: reg.major },
    { label: "TTL", value: reg.birthDate ? new Date(reg.birthDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-" },
  ]

  doc.setFontSize(5)
  let fieldY = y + 27
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...gray)
    doc.text(f.label + ":", infoX, fieldY)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...dark)
    const val = f.value.length > 20 ? f.value.substring(0, 20) + "..." : f.value
    doc.text(val, infoX + 12, fieldY)
    fieldY += 4
  }

  // Contact bar
  const contactY = y + cardH - 14
  doc.setFillColor(...lightGray)
  doc.setDrawColor(...lightGray)
  doc.roundedRect(x + 3, contactY, cardW - 6, 5, 1, 1, "F")

  doc.setFontSize(4.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...gray)
  doc.text("WA:", x + 6, contactY + 3.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...dark)
  doc.text(reg.whatsapp, x + 14, contactY + 3.5)

  if (reg.email) {
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...gray)
    doc.text("Email:", x + 40, contactY + 3.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...dark)
    const email = reg.email.length > 18 ? reg.email.substring(0, 18) + "..." : reg.email
    doc.text(email, x + 51, contactY + 3.5)
  }

  // Status badge
  const badgeY = y + cardH - 8
  let badgeColor: [number, number, number] = yellow
  let badgeText = "PENDING"
  if (reg.status === "accepted") { badgeColor = green; badgeText = "DITERIMA" }
  else if (reg.status === "rejected") { badgeColor = redBadge; badgeText = "DITOLAK" }

  doc.setFillColor(...badgeColor)
  doc.setDrawColor(...badgeColor)
  const badgeW = 22
  const badgeX = x + cardW - badgeW - 5
  doc.roundedRect(badgeX, badgeY, badgeW, 5, 1, 1, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(4.5)
  doc.setTextColor(...white)
  doc.text(badgeText, badgeX + badgeW / 2, badgeY + 3.5, { align: "center" })

  // Registration date
  doc.setFontSize(4)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...gray)
  const dateText = reg.createdAt
    ? new Date(reg.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "-"
  doc.text(dateText, x + 5, badgeY + 3.5)
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
    })

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageW = 297
    const pageH = 210

    const cardW = 86
    const cardH = 54
    const gapX = 6
    const gapY = 6
    const cols = 3
    const rows = 3
    const cardsPerPage = cols * rows

    const totalW = cols * cardW + (cols - 1) * gapX
    const totalH = rows * cardH + (rows - 1) * gapY
    const startX = (pageW - totalW) / 2
    const startY = (pageH - totalH) / 2

    const gray: [number, number, number] = [107, 114, 128]

    let cardIndex = 0

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i]
      const pageCardIndex = cardIndex % cardsPerPage

      if (cardIndex > 0 && pageCardIndex === 0) {
        doc.addPage()
      }

      const col = pageCardIndex % cols
      const row = Math.floor(pageCardIndex / cols)
      const x = startX + col * (cardW + gapX)
      const y = startY + row * (cardH + gapY)

      drawCard(doc, reg, x, y)
      cardIndex++
    }

    if (registrations.length === 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...gray)
      doc.text("Tidak ada data pendaftaran", pageW / 2, pageH / 2, { align: "center" })
    }

    const buffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="id-card-pmr-parstama-' + new Date().toISOString().split("T")[0] + '.pdf"',
      },
    })
  } catch (error) {
    console.error("Error exporting PDF:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat export PDF" },
      { status: 500 }
    )
  }
}