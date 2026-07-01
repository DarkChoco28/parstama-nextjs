"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface Event {
  id: string; title: string; description?: string; location?: string; startDate: string; endDate?: string; allDay: boolean; color: string; category: string
}

const categoryColors: Record<string, string> = { Pelatihan: "#3B82F6", Rapat: "#F59E0B", Kegiatan: "#E87A1A", Lainnya: "#8B5CF6" }
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay() }

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/events?month=${currentMonth + 1}&year=${currentYear}`)
      const d = await r.json()
      setEvents(d.events || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [currentMonth, currentYear])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter(e => {
      const start = new Date(e.startDate).toISOString().split("T")[0]
      const end = e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : start
      return dateStr >= start && dateStr <= end
    })
  }

  const today = new Date()
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear

  const selectedEvents = selectedDate ? events.filter(e => {
    const start = new Date(e.startDate).toISOString().split("T")[0]
    const end = e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : start
    return selectedDate >= start && selectedDate <= end
  }) : []

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <style>{`
        .cal-day { width: 100%; aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; color: rgba(255,255,255,.5); cursor: pointer; transition: all .2s; border: 1px solid transparent; position: relative; }
        .cal-day:hover { background: rgba(255,255,255,.05); }
        .cal-day.today { color: #F97316; font-weight: 700; border-color: rgba(232,122,26,.3); }
        .cal-day.selected { background: rgba(232,122,26,.15); border-color: rgba(232,122,26,.4); color: #fff; }
        .cal-day.has-event::after { content: ""; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: #E87A1A; }
        .cal-day.empty { cursor: default; }
        .cal-day.empty:hover { background: transparent; }
        .event-card { background: rgba(26,26,28,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: 14px 16px; border-left: 3px solid; transition: all .2s; }
        .event-card:hover { border-color: rgba(255,255,255,.12); background: rgba(26,26,28,1); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(10,10,11,.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-15 h-15 sm:w-16 sm:h-16 rounded-full object-contain" />
            <span style={{ fontFamily: "Sansita, Georgia, serif", fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARSTAMA</span>
          </Link>
          <Link href="/" style={{ color: "rgba(255,255,255,.5)", fontSize: 13, textDecoration: "none" }}>← Kembali</Link>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "Sansita, Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Event & <span style={{ background: "linear-gradient(90deg,#F97316,#E87A1A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kegiatan</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Jadwal kegiatan dan pelatihan PARSTAMA</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* Calendar */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13 }}>←</button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13 }}>→</button>
            </div>

            {/* Day names */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {dayNames.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", padding: "6px 0" }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="cal-day empty" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDay(day)
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                return (
                  <div key={day} className={`cal-day ${isToday(day) ? "today" : ""} ${selectedDate === dateStr ? "selected" : ""} ${dayEvents.length > 0 ? "has-event" : ""}`} onClick={() => setSelectedDate(dateStr)}>
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected date events or all upcoming */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              {selectedDate ? `Event ${new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "Semua Event"}
            </h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.3)" }}>Memuat event...</div>
            ) : (selectedDate ? selectedEvents : events).length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.3)" }}>Tidak ada event</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(selectedDate ? selectedEvents : events).map(ev => {
                  const start = new Date(ev.startDate)
                  return (
                    <div key={ev.id} className="event-card" style={{ borderLeftColor: ev.color }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${ev.color}15`, color: ev.color, border: `1px solid ${ev.color}30` }}>{ev.category}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{!ev.allDay && start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{ev.title}</h4>
                      {ev.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: "0 0 6px" }}>{ev.description}</p>}
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", display: "flex", gap: 12 }}>
                        <span>{start.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</span>
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
