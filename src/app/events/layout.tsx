import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Event Kegiatan - PARSTAMA",
  description: "Jadwal dan informasi event kegiatan Palang Meraah Remaja SMKN 1 Singosari. Pelatihan, rapat, dan kegiatan sosial.",
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
