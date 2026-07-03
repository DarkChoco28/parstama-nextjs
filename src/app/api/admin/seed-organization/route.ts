import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

const seedData = [
  // Level 0 — Pimpinan Utama
  {
    name: "Ahmad Rizki Pratama",
    nickname: "Rizki",
    position: "Ketua Umum",
    division: null,
    divisionDesc: null,
    bio: "Memimpin dengan hati, melayani dengan jiwa. Bertekad menjadikan PARSTAMA sebagai wadah pengembangan karakter dan keterampilan relawan muda.",
    level: 0,
    sortOrder: 0,
    period: "2025-2026",
  },
  {
    name: "Siti Nurhaliza",
    nickname: "Siti",
    position: "Wakil Ketua",
    division: null,
    divisionDesc: null,
    bio: "Mendukung visi organisasi dengan semangat kebersamaan. Fokus pada penguatan internal dan kesejahteraan anggota.",
    level: 0,
    sortOrder: 1,
    period: "2025-2026",
  },

  // Level 1 — Pengurus Inti
  {
    name: "Muhammad Fadil",
    nickname: "Fadil",
    position: "Sekretaris",
    division: "Sekretariat",
    divisionDesc: "Mengelola administrasi, dokumentasi, dan komunikasi internal organisasi.",
    bio: "Teliti dan terorganisir. Menjadi jantung administrasi yang menjaga setiap catatan dan komunikasi tetap berjalan lancar.",
    level: 1,
    sortOrder: 0,
    period: "2025-2026",
  },
  {
    name: "Aisyah Putri Ramadhani",
    nickname: "Aisyah",
    position: "Bendahara",
    division: "Keuangan",
    divisionDesc: "Mengelola keuangan organisasi, pembukuan, dan pelaporan keuangan secara transparan.",
    bio: "Jujur dan transparan dalam mengelola keuangan. Memastikan setiap rupiah dapat dimanfaatkan untuk kepentingan anggota.",
    level: 1,
    sortOrder: 1,
    period: "2025-2026",
  },
  {
    name: "Bayu Aditya Nugroho",
    nickname: "Bayu",
    position: "Kepala Bidang Keorganisasian",
    division: "Keorganisasian",
    divisionDesc: "Mengurus rekrutmen, pengembangan SDM, dan pembinaan anggota baru.",
    bio: "Bersemangat dalam membentuk karakter anggota. Percaya bahwa setiap orang memiliki potensi untuk menjadi relawan hebat.",
    level: 1,
    sortOrder: 2,
    period: "2025-2026",
  },
  {
    name: "Dwi Putri Anggraeni",
    nickname: "Dwi",
    position: "Kepala Bidang Kerohanian",
    division: "Kerohanian",
    divisionDesc: "Membina kegiatan rohani, mental spiritual, dan nilai-nilai kemanusiaan.",
    bio: "Membimbing anggota untuk tumbuh tidak hanya secara fisik tapi juga spiritual. Menjadi tonggak moral dalam setiap kegiatan.",
    level: 1,
    sortOrder: 3,
    period: "2025-2026",
  },
  {
    name: "Reza Fernando Sinaga",
    nickname: "Reza",
    position: "Kepala Bidang Kegiatan",
    division: "Kegiatan",
    divisionDesc: "Merencanakan dan melaksanakan kegiatan internal maupun eksternal organisasi.",
    bio: "Kreatif dan inovatif dalam merancang setiap kegiatan. Mewujudkan ide-ide segar menjadi aksi nyata yang berdampak.",
    level: 1,
    sortOrder: 4,
    period: "2025-2026",
  },

  // Level 2 — Staff Divisi
  {
    name: "Naura Aulia Rachma",
    nickname: "Naura",
    position: "Staff Keorganisasian",
    division: "Keorganisasian",
    divisionDesc: null,
    bio: "Membantu proses rekrutmen dan orientasi anggota baru dengan ramah dan sabar.",
    level: 2,
    sortOrder: 0,
    period: "2025-2026",
  },
  {
    name: "Farhan Akbar Maulana",
    nickname: "Farhan",
    position: "Staff Keorganisasian",
    division: "Keorganisasian",
    divisionDesc: null,
    bio: "Aktif dalam pengelolaan data anggota dan pelaporan kegiatan.",
    level: 2,
    sortOrder: 1,
    period: "2025-2026",
  },
  {
    name: "Kayla Putri Safitri",
    nickname: "Kayla",
    position: "Staff Kerohanian",
    division: "Kerohanian",
    divisionDesc: null,
    bio: "Mendukung pelaksanaan kegiatan rohani dan pembinaan mental anggota.",
    level: 2,
    sortOrder: 2,
    period: "2025-2026",
  },
  {
    name: "Ilham Pratama Putra",
    nickname: "Ilham",
    position: "Staff Kegiatan",
    division: "Kegiatan",
    divisionDesc: null,
    bio: "Membantu logistik dan teknis pelaksanaan setiap kegiatan PARSTAMA.",
    level: 2,
    sortOrder: 3,
    period: "2025-2026",
  },
  {
    name: "Melisa Oktaviani",
    nickname: "Melisa",
    position: "Staff Kegiatan",
    division: "Kegiatan",
    divisionDesc: null,
    bio: "Mengurus publikasi dan dokumentasi setiap kegiatan organisasi.",
    level: 2,
    sortOrder: 4,
    period: "2025-2026",
  },
]

export async function POST() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    // Clear existing data
    await prisma.organizationMember.deleteMany()

    // Insert seed data
    const created = await prisma.organizationMember.createMany({
      data: seedData.map((d) => ({
        ...d,
        isVisible: true,
      })),
    })

    createAuditLog({
      action: "seed_organization",
      userEmail: "admin",
      details: `Menambahkan ${created.count} anggota organisasi`,
    })

    return NextResponse.json({
      success: true,
      message: `Berhasil seed ${created.count} anggota organisasi`,
    })
  } catch (error) {
    console.error("Seed organization error:", error)
    return NextResponse.json(
      { error: "Gagal seed data organisasi" },
      { status: 500 }
    )
  }
}
