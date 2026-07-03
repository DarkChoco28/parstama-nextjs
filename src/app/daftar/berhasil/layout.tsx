import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pendaftaran Berhasil - PARSTAMA",
  description: "Pendaftaran anggota PARSTAMA SMKN 1 Singosari berhasil.",
  robots: { index: false, follow: false },
}

export default function BerhasilLayout({ children }: { children: React.ReactNode }) {
  return children
}
