import type { Metadata } from "next"
import LandingClient from "@/components/landing/LandingClient"

export const metadata: Metadata = {
  title: "PARSTAMA – SMKN 1 Singosari",
  description: "Sistem Pendaftaran Palang Merah Remaja PARSTAMA - SMKN 1 Singosari",
}

export default function Home() {
  return (
    <main className="bg-[#0A0A0B] text-[#E4E4E7] overflow-x-hidden">
      <LandingClient />
    </main>
  )
}
