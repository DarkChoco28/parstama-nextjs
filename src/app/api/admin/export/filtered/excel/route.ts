import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import XLSX from "xlsx-js-style"
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

    // Build filter description
    const filterParts: string[] = []
    if (status) filterParts.push(`Status: ${status}`)
    if (search) filterParts.push(`Pencarian: ${search}`)
    if (classFilter) filterParts.push(`Kelas: ${classFilter}`)
    if (major) filterParts.push(`Jurusan: ${major}`)
    if (gender) filterParts.push(`JK: ${gender === "L" ? "Laki-laki" : "Perempuan"}`)
    if (startDate) filterParts.push(`Dari: ${startDate}`)
    if (endDate) filterParts.push(`Sampai: ${endDate}`)
    const filterText = filterParts.length > 0 ? `Filter: ${filterParts.join(", ")}` : "Semua Data"

    const titleText = "DATA PENDAFTARAN PARSTAMA"
    const subtitleText = `Export: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} | Total: ${registrations.length} pendaftar | ${filterText}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[][] = []
    rows.push([titleText])
    rows.push([subtitleText])
    rows.push(columns.map((c) => c.header))

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

    const ws = XLSX.utils.aoa_to_sheet(rows)

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    ]

    ws["!cols"] = columns.map((col) => ({ wch: col.width }))

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

        if (c === 0) {
          alignment = { horizontal: "center", vertical: "center" }
        }

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

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftaran")

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="pendaftaran-pmr-parstama-filtered-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting filtered Excel:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat export Excel" },
      { status: 500 }
    )
  }
}
