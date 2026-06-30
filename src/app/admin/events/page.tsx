"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Event {
  id: string; title: string; description?: string; location?: string; startDate: string; endDate?: string; allDay: boolean; color: string; category: string; isVisible: boolean; createdAt: string
}

const defaultForm = { title: "", description: "", location: "", startDate: "", endDate: "", allDay: false, color: "#DC2626", category: "Kegiatan", isVisible: true }
const eventColors = ["#DC2626", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]

function formatDateLocal(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0"), h = String(d.getHours()).padStart(2, "0"), min = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${day}T${h}:${min}`
}

export default function AdminEvents() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" })
      if (searchQuery.trim()) params.append("search", searchQuery.trim())
      if (categoryFilter) params.append("category", categoryFilter)
      const r = await fetch(`/api/admin/events?${params}`)
      const d = await r.json()
      setEvents(d.events || [])
      setTotalPages(d.pagination?.totalPages || 1)
      setTotalResults(d.pagination?.total || 0)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [page, searchQuery, categoryFilter])

  useEffect(() => { if (status === "authenticated") fetchEvents() }, [status, fetchEvents])

  const openAdd = () => {
    setEditing(null)
    const now = new Date()
    setForm({ ...defaultForm, startDate: formatDateLocal(now) })
    setShowForm(true)
  }
  const openEdit = (e: Event) => {
    setEditing(e)
    setForm({
      title: e.title, description: e.description || "", location: e.location || "",
      startDate: formatDateLocal(new Date(e.startDate)),
      endDate: e.endDate ? formatDateLocal(new Date(e.endDate)) : "",
      allDay: e.allDay, color: e.color, category: e.category, isVisible: e.isVisible
    })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(defaultForm) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.startDate) return alert("Judul dan tanggal wajib diisi")
    setSaving(true)
    try {
      const url = editing ? `/api/admin/events/${editing.id}` : "/api/admin/events"
      const method = editing ? "PUT" : "POST"
      const body = { ...form, endDate: form.endDate || undefined }
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (r.ok) { closeForm(); fetchEvents() } else { const d = await r.json(); alert(d.error || "Gagal menyimpan") }
    } catch (e) { console.error(e); alert("Terjadi kesalahan") } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try { const r = await fetch(`/api/admin/events/${id}`, { method: "DELETE" }); if (r.ok) { setDeleteConfirm(null); fetchEvents() } } catch (e) { console.error(e) }
  }

  const toggleVisibility = async (e: Event) => {
    try { await fetch(`/api/admin/events/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !e.isVisible }) }); fetchEvents() } catch (err) { console.error(err) }
  }

  const categoryColors: Record<string, string> = { Pelatihan: "#3B82F6", Rapat: "#F59E0B", Kegiatan: "#DC2626", Lainnya: "#8B5CF6" }

  if (status === "loading" || (loading && events.length === 0)) {
    return <div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat event...</span></div>
  }

  return (
      <main className="admin-main">
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="admin-title">Event & Kegiatan</h2>
            <p className="admin-subtitle">{totalResults} event</p>
          </div>
          <button onClick={openAdd} className="admin-btn-primary">+ Event Baru</button>
        </div>

        {/* Filters */}
        <div className="admin-card" style={{ padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchEvents() } }} placeholder="Cari event..." className="admin-input" style={{ flex: 1, minWidth: 150 }} />
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="admin-select">
              <option value="">Semua Kategori</option>
              <option value="Pelatihan">Pelatihan</option>
              <option value="Rapat">Rapat</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Events list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.length === 0 && <div className="admin-card" style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)" }}>Tidak ada event</div>}
          {events.map(ev => {
            const start = new Date(ev.startDate)
            const isPast = start < new Date()
            return (
              <div key={ev.id} className="admin-card" style={{ padding: "16px 20px", opacity: isPast ? 0.6 : 1 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: `${ev.color}15`, border: `1px solid ${ev.color}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: ev.color, lineHeight: 1 }}>{start.getDate()}</span>
                    <span style={{ fontSize: 9, color: ev.color, fontWeight: 600 }}>{start.toLocaleDateString("id-ID", { month: "short" })}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{ev.title}</h3>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: `${ev.color}15`, color: ev.color, border: `1px solid ${ev.color}30`, fontWeight: 600 }}>{ev.category}</span>
                      {!ev.isVisible && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.1)", fontWeight: 600 }}>Hidden</span>}
                    </div>
                    {ev.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.description}</p>}
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,.3)", flexWrap: "wrap" }}>
                      <span>{start.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{!ev.allDay && ` ${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => toggleVisibility(ev)} className={ev.isVisible ? "admin-btn-email-sm" : "admin-btn-success-sm"}>{ev.isVisible ? "Sembunyikan" : "Tampilkan"}</button>
                    <button onClick={() => openEdit(ev)} className="admin-btn-blue-sm">Edit</button>
                    {deleteConfirm === ev.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => handleDelete(ev.id)} className="admin-btn-danger-sm">Ya</button>
                        <button onClick={() => setDeleteConfirm(null)} className="admin-btn-blue-sm">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(ev.id)} className="admin-btn-danger-sm">Hapus</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="admin-page-btn">Sebelumnya</button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center" }}>{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="admin-page-btn">Selanjutnya</button>
          </div>
        )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="reg-modal-overlay" onClick={closeForm}>
          <div className="reg-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="reg-modal-header">
              <h2 className="reg-modal-title">{editing ? "Edit Event" : "Event Baru"}</h2>
              <button onClick={closeForm} className="reg-modal-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="reg-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Judul *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="Nama event" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Tanggal Mulai *</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Tanggal Selesai</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="admin-input" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-input" rows={3} placeholder="Deskripsi event..." style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Lokasi</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="admin-input" placeholder="Lokasi" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="admin-select" style={{ width: "100%", padding: "10px 12px" }}>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Rapat">Rapat</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, display: "block" }}>Warna</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {eventColors.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: form.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", transition: "all .2s" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="admin-checkbox" /> Sepanjang hari
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isVisible} onChange={e => setForm({ ...form, isVisible: e.target.checked })} className="admin-checkbox" /> Visible
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <button onClick={closeForm} className="admin-page-btn">Batal</button>
                <button onClick={handleSave} disabled={saving} className="admin-btn-primary">{saving ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
  )
}
