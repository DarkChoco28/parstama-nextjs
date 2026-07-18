import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pendaftaran - PARSTAMA",
  description: "Daftar menjadi anggota PARSTAMA PMR SMKN 1 Singosari. Isi formulir pendaftaran online.",
  robots: { index: true, follow: true },
}

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return children
}
