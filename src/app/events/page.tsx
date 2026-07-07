import Link from "next/link"
import Image from "next/image"
import EventsClient from "./EventsClient"

async function getInitialEvents() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" })
    if (!res.ok) return { events: [] as { id: string; title: string; description?: string; startDate: string; endDate?: string; location?: string; category: string; color: string; allDay: boolean }[] }
    const d = await res.json()
    return { events: d.events || [] }
  } catch {
    return { events: [] as { id: string; title: string; description?: string; startDate: string; endDate?: string; location?: string; category: string; color: string; allDay: boolean }[] }
  }
}

export default async function EventsPage() {
  const { events } = await getInitialEvents()

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <style>{`
        .admin-card{background:rgba(20,20,22,.8);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.08)}
        .cal-day{padding:8px 4px;text-align:center;font-size:13px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.7);transition:all .2s;font-weight:500}
        .cal-day:hover{background:rgba(232,122,26,.15);color:#F97316}
        .cal-day.today{background:rgba(232,122,26,.2);color:#F97316;font-weight:700;border:1px solid rgba(232,122,26,.3)}
        .cal-day.selected{background:rgba(232,122,26,.3);color:#fff;font-weight:700}
        .cal-day.has-event{text-decoration:underline;text-underline-offset:3px;text-decoration-color:#F97316;text-decoration-thickness:2px}
        .cal-day.empty{cursor:default}
        .cal-day.empty:hover{background:transparent}
      `}</style>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(10,10,11,.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} unoptimized className="w-15 h-15 sm:w-16 sm:h-16 rounded-full object-contain" />
            <span style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARSTAMA</span>
          </Link>
          <Link href="/" style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>← Kembali</Link>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-sansita), Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Event & <span style={{ background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kegiatan</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Jadwal kegiatan dan pelatihan PARSTAMA</p>
        </div>

        <EventsClient initialEvents={events} />
      </main>
    </div>
  )
}
