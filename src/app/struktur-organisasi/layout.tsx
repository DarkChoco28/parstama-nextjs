import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Struktur Organisasi - PARSTAMA",
  description: "Struktur organisasi PARSTAMA (Palang Merah Remaja) SMKN 1 Singosari. Daftar pengurus dan jabatan.",
}

export default function StrukturLayout({ children }: { children: React.ReactNode }) {
  return children
}
