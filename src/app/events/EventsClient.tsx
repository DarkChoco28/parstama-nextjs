"use client"

import { useState, useEffect, useCallback } from "react"

interface Event {
  id: string; title: string; description?: string; startDate: string; endDate?: string; location?: string; category: string; color: string; allDay: boolean
}

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const eventColors = ["#EF4444", "#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"]

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null)
  const [rsvpName, setRsvpName] = useState("")
  const [rsvpWa, setRsvpWa] = useState("")
  const [rsvpEmail, setRsvpEmail] = useState("")
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false)
  const [rsvpMessage, setRsvpMessage] = useState("")
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({})

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/events")
      const d = await r.json()
      setEvents(d.events || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialEvents.length === 0) {
      fetchEvents()
    }
  }, [initialEvents.length, fetchEvents])
  /* eslint-enable react-hooks/set-state-in-effect */

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const isToday = (day: number) => { const t = new Date(); return t.getDate() === day && t.getMonth() === currentMonth && t.getFullYear() === currentYear }
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter(e => e.startDate.startsWith(dateStr))
  }

  const filteredEvents = selectedDate
    ? events.filter(e => e.startDate.startsWith(selectedDate))
    : events.filter(e => new Date(e.startDate) >= new Date()).slice(0, 10)

  const formatDate = (d: string) => {
    const dt = new Date(d)
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const handleRsvp = async (eventId: string) => {
    if (!rsvpName.trim() || !rsvpWa.trim()) return
    setRsvpSubmitting(true)
    setRsvpMessage("")
    try {
      const r = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rsvpName.trim(), whatsapp: rsvpWa.trim(), email: rsvpEmail.trim() || undefined }),
      })
      const d = await r.json()
      if (r.ok) {
        setRsvpMessage("RSVP berhasil!")
        setRsvpEventId(null)
        setRsvpName(""); setRsvpWa(""); setRsvpEmail("")
        setRsvpCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }))
      } else {
        setRsvpMessage(d.error || "Gagal RSVP")
      }
    } catch {
      setRsvpMessage("Gagal RSVP")
    } finally {
      setRsvpSubmitting(false)
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
      <div className="admin-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={prevMonth} aria-label="Bulan sebelumnya" style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13 }}>←</button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} aria-label="Bulan berikutnya" style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13 }}>→</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", padding: "6px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="cal-day empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDay(day)
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            return (
              <div key={day} className={`cal-day ${isToday(day) ? "today" : ""} ${selectedDate === dateStr ? "selected" : ""} ${dayEvents.length > 0 ? "has-event" : ""}`} role="button" aria-label={`Pilih tanggal ${day} ${monthNames[currentMonth]} ${currentYear}`} onClick={() => setSelectedDate(dateStr)}>
                {day}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
          {selectedDate ? `Event ${new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "Semua Event"}
        </h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.3)" }}>Memuat event...</div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.3)" }}>Tidak ada event</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredEvents.map(e => (
              <div key={e.id} className="admin-card" style={{ padding: "14px 18px", borderLeft: `4px solid ${e.color || "#E87A1A"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{e.title}</h4>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", margin: 0 }}>{formatDate(e.startDate)}{e.endDate ? ` - ${formatDate(e.endDate)}` : ""}</p>
                    {e.location && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: "4px 0 0" }}>📍 {e.location}</p>}
                    {e.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: "4px 0 0", lineHeight: 1.5 }}>{e.description}</p>}
                  </div>
                  <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${eventColors.includes(e.color) ? e.color : "#E87A1A"}15`, color: eventColors.includes(e.color) ? e.color : "#E87A1A", border: `1px solid ${eventColors.includes(e.color) ? e.color : "#E87A1A"}30` }}>{e.category}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setRsvpEventId(rsvpEventId === e.id ? null : e.id)}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: rsvpEventId === e.id ? "rgba(232,122,26,.15)" : "rgba(255,255,255,.05)", color: rsvpEventId === e.id ? "#F59E0B" : "rgba(255,255,255,.5)", border: `1px solid ${rsvpEventId === e.id ? "rgba(232,122,26,.3)" : "rgba(255,255,255,.1)"}`, cursor: "pointer" }}
                  >
                    {rsvpEventId === e.id ? "Batal" : "RSVP"}
                  </button>
                  {rsvpCounts[e.id] !== undefined && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{rsvpCounts[e.id]} orang hadir</span>
                  )}
                </div>
                {rsvpEventId === e.id && (
                  <div style={{ marginTop: 10, padding: 12, background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)" }}>
                    <input type="text" value={rsvpName} onChange={ev => setRsvpName(ev.target.value)} placeholder="Nama" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 12, outline: "none", marginBottom: 6 }} />
                    <input type="text" value={rsvpWa} onChange={ev => setRsvpWa(ev.target.value)} placeholder="WhatsApp" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 12, outline: "none", marginBottom: 6 }} />
                    <input type="email" value={rsvpEmail} onChange={ev => setRsvpEmail(ev.target.value)} placeholder="Email (opsional)" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 12, outline: "none", marginBottom: 6 }} />
                    <button onClick={() => handleRsvp(e.id)} disabled={rsvpSubmitting || !rsvpName.trim() || !rsvpWa.trim()} style={{ padding: "6px 16px", borderRadius: 6, background: "linear-gradient(135deg,#E87A1A,#F59E0B)", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", opacity: rsvpSubmitting || !rsvpName.trim() || !rsvpWa.trim() ? 0.5 : 1 }}>
                      {rsvpSubmitting ? "Mengirim..." : "Kirim RSVP"}
                    </button>
                    {rsvpMessage && <p style={{ fontSize: 11, color: rsvpMessage.includes("berhasil") ? "#34D399" : "#F87171", marginTop: 6 }}>{rsvpMessage}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
