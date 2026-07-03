import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login Admin - PARSTAMA",
  description: "Halaman login admin PARSTAMA SMKN 1 Singosari",
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
