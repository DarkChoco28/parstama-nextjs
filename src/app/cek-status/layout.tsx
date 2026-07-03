import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Assistant - PARSTAMA",
  description: "Tanya AI tentang pendaftaran, PARSTAMA, dan informasi lainnya. Asisten virtual PARSTAMA SMKN 1 Singosari.",
  robots: { index: false, follow: true },
}

export default function CekStatusLayout({ children }: { children: React.ReactNode }) {
  return children
}
