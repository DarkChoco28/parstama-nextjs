import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import XLSX from "xlsx-js-style"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
    })

    const border = { style: "thin" as const, color: { rgb: "000000" } }
    const allBorders = { top: border, bottom: border, left: border, right: border }

    const columns = [
      { key: "no", header: "No", width: 5 },
      { key: "fullName", header: "Nama Lengkap", width: 28 },
      { key: "nickname", header: "Nama Panggilan", width: 16 },
      { key: "gender", header: "Jenis Kelamin", width: 14 },
      { key: "birthPlace", header: "Tempat Lahir", width: 18 },
      { key: "birthDate", header: "Tanggal Lahir", width: 16 },
      { key: "religion", header: "Agama", width: 12 },
      { key: "address", header: "Alamat", width: 35 },
      { key: "city", header: "Kota", width: 16 },
      { key: "province", header: "Provinsi", width: 16 },
      { key: "postalCode", header: "Kode Pos", width: 10 },
      { key: "whatsapp", header: "WhatsApp", width: 18 },
      { key: "email", header: "Email", width: 26 },
      { key: "class", header: "Kelas", width: 12 },
      { key: "major", header: "Jurusan", width: 16 },
      { key: "bloodType", header: "Gol. Darah", width: 10 },
      { key: "medicalHistory", header: "Riwayat Medis", width: 30 },
      { key: "organizationExperience", header: "Pengalaman Organisasi", width: 30 },
      { key: "motivation", header: "Motivasi", width: 40 },
      { key: "status", header: "Status", width: 14 },
      { key: "createdAt", header: "Tanggal Daftar", width: 20 },
    ]

    // ── Build data array ──
    const titleText = "DATA PENDAFTARAN PARSTAMA"
    const subtitleText = `Export: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} | Total: ${registrations.length} pendaftar`

    // Row 1: title, Row 2: subtitle, Row 3: headers, Row 4+: data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[][] = []

    // Row 1 - title
    rows.push([titleText])
    // Row 2 - subtitle
    rows.push([subtitleText])
    // Row 3 - headers
    rows.push(columns.map((c) => c.header))
    // Data rows
    registrations.forEach((reg, ri) => {
      rows.push([
        ri + 1,
        reg.fullName,
        reg.nickname || "-",
        reg.gender === "L" ? "Laki-laki" : "Perempuan",
        reg.birthPlace,
        reg.birthDate ? new Date(reg.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-",
        reg.religion || "-",
        reg.address,
        reg.city || "-",
        reg.province || "-",
        reg.postalCode || "-",
        reg.whatsapp,
        reg.email || "-",
        reg.class,
        reg.major,
        reg.bloodType || "-",
        reg.medicalHistory || "-",
        reg.organizationExperience || "-",
        reg.motivation,
        reg.status === "pending" ? "Pending" : reg.status === "accepted" ? "Diterima" : "Ditolak",
        reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-",
      ])
    })

    // ── Create sheet from array ──
    const ws = XLSX.utils.aoa_to_sheet(rows)

    // ── Merges ──
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    ]

    // ── Column widths ──
    ws["!cols"] = columns.map((col) => ({ wch: col.width }))

    // ── Row heights ──
    const totalRows = 3 + registrations.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowHeights: any[] = []
    rowHeights[0] = { hpt: 36 }
    rowHeights[1] = { hpt: 22 }
    rowHeights[2] = { hpt: 28 }
    for (let i = 3; i < totalRows; i++) {
      rowHeights[i] = { hpt: 22 }
    }
    ws["!rows"] = rowHeights

    // ── Apply styles to each cell ──
    // Title row (row 0)
    for (let c = 0; c <= columns.length - 1; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c })
      if (ws[ref]) {
        ws[ref].s = {
          font: { bold: true, sz: 16, name: "Calibri", color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "DC2626" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: allBorders,
        }
      }
    }

    // Subtitle row (row 1)
    for (let c = 0; c <= columns.length - 1; c++) {
      const ref = XLSX.utils.encode_cell({ r: 1, c })
      if (ws[ref]) {
        ws[ref].s = {
          font: { sz: 10, name: "Calibri", color: { rgb: "666666" } },
          fill: { fgColor: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: allBorders,
        }
      }
    }

    // Header row (row 2)
    for (let c = 0; c < columns.length; c++) {
      const ref = XLSX.utils.encode_cell({ r: 2, c })
      if (ws[ref]) {
        ws[ref].s = {
          font: { bold: true, sz: 11, name: "Calibri", color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1F2937" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: allBorders,
        }
      }
    }

    // Data rows (row 3+)
    registrations.forEach((reg, ri) => {
      const rowNum = 3 + ri
      const isAlt = ri % 2 === 1

      for (let c = 0; c < columns.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: rowNum, c })
        if (!ws[ref]) continue

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let font: any = { sz: 10, name: "Calibri", color: { rgb: "333333" } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fill: any = isAlt ? { fgColor: { rgb: "F9FAFB" } } : { fgColor: { rgb: "FFFFFF" } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let alignment: any = { horizontal: "left", vertical: "center", wrapText: c >= 7 && c <= 8 || c >= 16 && c <= 18 }

        // No column center
        if (c === 0) {
          alignment = { horizontal: "center", vertical: "center" }
        }

        // Status column
        if (c === 19) {
          alignment = { horizontal: "center", vertical: "center" }
          if (reg.status === "pending") {
            font = { bold: true, sz: 10, name: "Calibri", color: { rgb: "92400E" } }
            fill = { fgColor: { rgb: "FEF3C7" } }
          } else if (reg.status === "accepted") {
            font = { bold: true, sz: 10, name: "Calibri", color: { rgb: "065F46" } }
            fill = { fgColor: { rgb: "D1FAE5" } }
          } else {
            font = { bold: true, sz: 10, name: "Calibri", color: { rgb: "991B1B" } }
            fill = { fgColor: { rgb: "FEE2E2" } }
          }
        }

        ws[ref].s = { font, fill, alignment, border: allBorders }
      }
    })

    // ── Create workbook ──
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftaran")

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="pendaftaran-pmr-parstama-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting Excel:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat export Excel" },
      { status: 500 }
    )
  }
}