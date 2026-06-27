import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import jsPDF from "jspdf"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const members = await prisma.organizationMember.findMany({
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    })

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageW = 210
    const red = [220, 38, 38] as [number, number, number]
    const dark = [17, 24, 39] as [number, number, number]
    const gray = [107, 114, 128] as [number, number, number]

    // Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(...red)
    doc.text("STRUKTUR ORGANISASI PARSTAMA", pageW / 2, 20, { align: "center" })

    const periods = [...new Set(members.map((m) => m.period).filter(Boolean))]
    if (periods.length > 0) {
      doc.setFontSize(10)
      doc.setTextColor(...gray)
      doc.text(`Periode ${periods.join(", ")}`, pageW / 2, 27, { align: "center" })
    }

    // Divider
    doc.setDrawColor(...red)
    doc.setLineWidth(0.5)
    doc.line(20, 32, pageW - 20, 32)

    // Group by level
    const level0 = members.filter((m) => m.level === 0)
    const level1 = members.filter((m) => m.level === 1)
    const level2 = members.filter((m) => m.level === 2)

    const divisions = [...new Set(members.map((m) => m.division).filter(Boolean) as string[])]

    let y = 42

    // Level 0 — Pimpinan
    if (level0.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...red)
      doc.text("PIMPINAN UTAMA", 20, y)
      y += 7
      level0.forEach((m) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(...dark)
        doc.text(`${m.position}:`, 25, y)
        const name = m.nickname ? `${m.name} (${m.nickname})` : m.name
        doc.setFont("helvetica", "normal")
        doc.text(name, 60, y)
        y += 6
        if (m.bio) {
          doc.setFontSize(8)
          doc.setTextColor(...gray)
          const lines = doc.splitTextToSize(m.bio, 160)
          lines.forEach((line: string) => {
            doc.text(line, 30, y)
            y += 4
          })
          y += 2
        }
      })
      y += 4
    }

    // Level 1 — Kepala Divisi
    if (level1.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...red)
      doc.text("KEPALA DIVISI", 20, y)
      y += 7
      level1.forEach((m) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(...dark)
        doc.text(`${m.position}:`, 25, y)
        const name = m.nickname ? `${m.name} (${m.nickname})` : m.name
        doc.setFont("helvetica", "normal")
        doc.text(name, 60, y)
        y += 5
        if (m.division) {
          doc.setFont("helvetica", "italic")
          doc.setFontSize(8)
          doc.setTextColor(...gray)
          doc.text(`Divisi ${m.division}`, 30, y)
          y += 4
        }
        if (m.bio) {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(...gray)
          const lines = doc.splitTextToSize(m.bio, 150)
          lines.forEach((line: string) => {
            doc.text(line, 30, y)
            y += 4
          })
          y += 2
        }
      })
      y += 4
    }

    // Level 2 — Staff by Division
    if (level2.length > 0) {
      for (const div of divisions) {
        const divMembers = level2.filter((m) => m.division === div)
        if (divMembers.length === 0) continue

        if (y > 250) {
          doc.addPage()
          y = 20
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(...red)
        doc.text(`DIVISI ${div.toUpperCase()}`, 20, y)
        y += 7

        divMembers.forEach((m, i) => {
          if (y > 270) {
            doc.addPage()
            y = 20
          }
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.setTextColor(...dark)
          const name = m.nickname ? `${m.name} (${m.nickname})` : m.name
          doc.text(`${i + 1}. ${name}`, 25, y)
          doc.setFont("helvetica", "bold")
          doc.text(m.position, 90, y)
          y += 5
          if (m.bio) {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)
            doc.setTextColor(...gray)
            const lines = doc.splitTextToSize(m.bio, 130)
            lines.forEach((line: string) => {
              doc.text(line, 30, y)
              y += 4
            })
          }
          y += 2
        })
        y += 4
      }
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(...gray)
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageW / 2, 290, { align: "center" })

    const buffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="struktur-organisasi-parstama-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error exporting organization PDF:", error)
    return NextResponse.json({ error: "Gagal export PDF" }, { status: 500 })
  }
}
