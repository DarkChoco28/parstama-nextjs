import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artikel & Blog - PARSTAMA",
  description: "Artikel kesehatan, P3K, dan kegiatan PARSTAMA SMKN 1 Singosari. Baca informasi terbaru seputar PMR.",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
