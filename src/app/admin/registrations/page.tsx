"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminRegistrations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [majorFilter, setMajorFilter] = useState("")
  const [genderFilter, setGenderFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filterOptions, setFilterOptions] = useState({ classes: [] as string[], majors: [] as string[], genders: [] as string[] })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailData, setDetailData] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [emailSending, setEmailSending] = useState<string | null>(null)
  const [waSending, setWaSending] = useState<string | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    update(); const i = setInterval(update, 1000); return () => clearInterval(i)
  }, [])

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams({ page: page.toString(), limit: "10" })
    if (statusFilter) params.append("status", statusFilter)
    if (searchQuery.trim()) params.append("search", searchQuery.trim())
    if (classFilter) params.append("class", classFilter)
    if (majorFilter) params.append("major", majorFilter)
    if (genderFilter) params.append("gender", genderFilter)
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    return params
  }, [page, statusFilter, searchQuery, classFilter, majorFilter, genderFilter, startDate, endDate])

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildFilterParams()
      const r = await fetch(`/api/admin/registrations?${params}`)
      const d = await r.json()
      setRegistrations(d.registrations); setTotalPages(d.pagination.totalPages); setTotalResults(d.pagination.total)
      if (d.filters) setFilterOptions(d.filters)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [buildFilterParams])

  useEffect(() => { if (status === "authenticated") fetchRegistrations() }, [status, fetchRegistrations])

  const updateStatus = async (id: string, s: string) => {
    try {
      const r = await fetch(`/api/admin/registrations/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) })
      const d = await r.json()
      if (r.ok) {
        const statusLabel = s === "accepted" ? "Diterima" : "Ditolak"
        let msg = `Status diubah ke "${statusLabel}"\n`
        if (d._emailStatus === "sent") msg += `\nEmail notif dikirim ke ${d.email}`
        else if (d._emailStatus === "failed") msg += `\nGagal kirim email: ${d._emailError}`
        if (d._waStatus === "sent") msg += `\nWA notif dikirim ke ${d.whatsapp}`
        else if (d._waStatus === "failed") msg += `\nGagal kirim WA: ${d._waError}`
        alert(msg)
        fetchRegistrations()
      }
    } catch (e) { console.error(e) }
  }
  const deleteRegistration = async (id: string) => {
    if (!confirm("Yakin hapus pendaftaran ini?")) return
    try { const r = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" }); if (r.ok) fetchRegistrations() } catch (e) { console.error(e) }
  }
  const bulkDelete = async () => {
    if (!confirm(`Yakin hapus ${selectedIds.length} pendaftaran?`)) return
    try { await Promise.all(selectedIds.map(id => fetch(`/api/admin/registrations/${id}`, { method: "DELETE" }))); setSelectedIds([]); fetchRegistrations() } catch (e) { console.error(e) }
  }
  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleSelectAll = () => setSelectedIds(p => p.length === registrations.length ? [] : registrations.map((r: any) => r.id))
  const viewDetail = async (id: string) => {
    setDetailLoading(true)
    try { const r = await fetch(`/api/admin/registrations/${id}`); const d = await r.json(); setDetailData(d) }
    catch (e) { console.error(e) } finally { setDetailLoading(false) }
  }

  const sendEmailNotif = async (registrationId: string) => {
    setEmailSending(registrationId)
    try {
      const r = await fetch("/api/admin/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, type: "status_update" }),
      })
      const d = await r.json()
      if (r.ok) alert("Email berhasil dikirim!")
      else alert(d.error || "Gagal mengirim email")
    } catch (e) { console.error(e); alert("Gagal mengirim email") }
    finally { setEmailSending(null) }
  }

  const sendWaNotif = async (registrationId: string) => {
    setWaSending(registrationId)
    try {
      const r = await fetch("/api/admin/notifications/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      })
      const d = await r.json()
      if (r.ok) alert("WhatsApp berhasil dikirim!")
      else alert(d.error || "Gagal mengirim WhatsApp")
    } catch (e) { console.error(e); alert("Gagal mengirim WhatsApp") }
    finally { setWaSending(null) }
  }

  const getFilteredExportUrl = (type: "excel" | "pdf") => {
    const params = buildFilterParams()
    params.delete("page")
    params.delete("limit")
    return `/api/admin/export/filtered/${type}?${params.toString()}`
  }

  const clearFilters = () => {
    setStatusFilter("")
    setSearchQuery("")
    setClassFilter("")
    setMajorFilter("")
    setGenderFilter("")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  const hasActiveFilters = statusFilter || searchQuery || classFilter || majorFilter || genderFilter || startDate || endDate

  if (status === "loading" || loading) {
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat data...</span><style>{adminCss}</style></div>)
  }
  if (!session) return null

  const navLinks = [
    { href: "/admin/registrations", label: "Pendaftaran", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { href: "/admin/profile", label: "Profile", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { href: "/admin/register", label: "+ Admin", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
  ]

  return (
    <div className="admin-page">
      <style>{adminCss}</style>

      <div className="admin-cross" style={{ top: "8%", right: "4%", width: 18, height: 18, animation: "dashCross1 10s ease-in-out infinite" }}>
        <div className="cross-h" /><div className="cross-v" />
      </div>

      {/* NAVBAR */}
      <nav className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-nav-left">
            <Link href="/admin/dashboard" className="admin-back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              <span className="admin-back-text">Dashboard</span>
            </Link>
            <div className="admin-divider" />
            <div className="admin-logos">
              <div className="admin-logo-wrap"><img src="/smkn_logo.png" alt="SMKN" className="admin-logo" /></div>
              <div className="admin-logo-wrap"><img src="/parstama_logo.png" alt="PARSTAMA" className="admin-logo" /></div>
            </div>
            <div className="admin-nav-title">
              <span className="admin-brand">Pendaftaran</span>
              <span className="admin-time">{currentTime}</span>
            </div>
          </div>
          <div className="admin-nav-links-desktop">
            <Link href="/" className="admin-nav-link admin-home-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Website</Link>
            <Link href="/admin/profile" className="admin-nav-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile</Link>
            <Link href="/admin/register" className="admin-nav-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>+ Admin</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="admin-nav-link admin-logout-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Logout</button>
          </div>
          <button className="admin-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>}
          </button>
        </div>
        {menuOpen && (
          <div className="admin-mobile-menu">
            <Link href="/" className="admin-mobile-link admin-home-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Kembali ke Website</Link>
            <Link href="/admin/dashboard" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>Dashboard</Link>
            <Link href="/admin/profile" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile</Link>
            <Link href="/admin/register" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>+ Admin</Link>
            <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false) }} className="admin-mobile-link admin-logout-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Logout</button>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Filters */}
          <div className="reg-filters">
            <div className="reg-search-row">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchRegistrations() } }} placeholder="Cari nama, email, atau WhatsApp..." className="admin-input" style={{ flex: 1 }} />
              <button onClick={() => { setPage(1); fetchRegistrations() }} className="admin-btn-primary">Cari</button>
              <button onClick={() => setShowFilters(!showFilters)} className={`admin-btn-filter ${showFilters ? "admin-btn-filter-active" : ""}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>
                Filter
              </button>
            </div>

            {/* Quick filters */}
            <div className="reg-filter-row">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="admin-select">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
              <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1) }} className="admin-select">
                <option value="">Semua Kelas</option>
                {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={majorFilter} onChange={e => { setMajorFilter(e.target.value); setPage(1) }} className="admin-select">
                <option value="">Semua Jurusan</option>
                {filterOptions.majors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="reg-advanced-filters">
                <div className="reg-advanced-row">
                  <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(1) }} className="admin-select">
                    <option value="">Semua Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <div className="reg-date-range">
                    <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1) }} className="admin-input" placeholder="Dari tanggal" />
                    <span className="reg-date-separator">s/d</span>
                    <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1) }} className="admin-input" placeholder="Sampai tanggal" />
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="admin-btn-clear">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                    Hapus Semua Filter
                  </button>
                )}
              </div>
            )}

            {/* Results info & export */}
            <div className="reg-filter-footer">
              <span className="reg-result-count">{totalResults} data ditemukan</span>
              <div className="reg-filter-actions">
                {selectedIds.length > 0 && (
                  <button onClick={bulkDelete} className="admin-btn-danger-sm">Hapus ({selectedIds.length})</button>
                )}
                <a href={getFilteredExportUrl("excel")} className="admin-btn-success-sm">Export Excel</a>
                <a href={getFilteredExportUrl("pdf")} className="admin-btn-blue-sm">Export PDF</a>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="reg-mobile-list">
            {registrations.length === 0 && <div className="reg-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:"0 auto 12px",opacity:.3,display:"block"}}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Tidak ada data pendaftaran</div>}
            {registrations.map((r: any, idx: number) => (
              <div key={r.id} className="reg-mobile-card">
                <div className="reg-mobile-header">
                  <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="admin-checkbox" />
                  <span className="reg-mobile-idx">{(page - 1) * 10 + idx + 1}</span>
                  <span className="reg-mobile-name">{r.fullName}</span>
                  <span className={`reg-badge reg-badge-${r.status}`}>{r.status === "pending" ? "Pending" : r.status === "accepted" ? "Diterima" : "Ditolak"}</span>
                </div>
                <div className="reg-mobile-fields">
                  <div className="reg-mobile-field"><span>Email</span><span>{r.email || "-"}</span></div>
                  <div className="reg-mobile-field"><span>WhatsApp</span><span>{r.whatsapp}</span></div>
                  <div className="reg-mobile-field"><span>Kelas</span><span>{r.class}</span></div>
                  <div className="reg-mobile-field"><span>Jurusan</span><span>{r.major}</span></div>
                  <div className="reg-mobile-field"><span>JK</span><span>{r.gender === "L" ? "Laki-laki" : "Perempuan"}</span></div>
                </div>
                <div className="reg-mobile-actions">
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="admin-select-sm">
                    <option value="pending">Pending</option>
                    <option value="accepted">Diterima</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                  <button onClick={() => viewDetail(r.id)} className="admin-btn-blue-sm">Lihat</button>
                  {r.email && (
                    <button onClick={() => sendEmailNotif(r.id)} disabled={emailSending === r.id} className="admin-btn-email-sm">
                      {emailSending === r.id ? "..." : "Email"}
                    </button>
                  )}
                  <button onClick={() => sendWaNotif(r.id)} disabled={waSending === r.id} className="admin-btn-wa-sm">
                    {waSending === r.id ? "..." : "WA"}
                  </button>
                  <button onClick={() => deleteRegistration(r.id)} className="admin-btn-danger-sm">Hapus</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="reg-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th" style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === registrations.length && registrations.length > 0} onChange={toggleSelectAll} className="admin-checkbox" /></th>
                  <th className="admin-th">Nama</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">WhatsApp</th>
                  <th className="admin-th">Kelas</th>
                  <th className="admin-th">Jurusan</th>
                  <th className="admin-th">JK</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r: any) => (
                  <tr key={r.id} className="admin-tr">
                    <td className="admin-td"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="admin-checkbox" /></td>
                    <td className="admin-td admin-td-bold">{r.fullName}</td>
                    <td className="admin-td admin-td-muted">{r.email || "-"}</td>
                    <td className="admin-td admin-td-muted">{r.whatsapp}</td>
                    <td className="admin-td admin-td-muted">{r.class}</td>
                    <td className="admin-td admin-td-muted">{r.major}</td>
                    <td className="admin-td admin-td-muted">{r.gender === "L" ? "L" : "P"}</td>
                    <td className="admin-td"><span className={`reg-badge reg-badge-${r.status}`}>{r.status === "pending" ? "Pending" : r.status === "accepted" ? "Diterima" : "Ditolak"}</span></td>
                    <td className="admin-td">
                      <div className="reg-action-btns">
                        <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="admin-select-sm"><option value="pending">Pending</option><option value="accepted">Diterima</option><option value="rejected">Ditolak</option></select>
                        <button onClick={() => viewDetail(r.id)} className="admin-btn-blue-sm">Lihat</button>
                        {r.email && (
                          <button onClick={() => sendEmailNotif(r.id)} disabled={emailSending === r.id} className="admin-btn-email-sm">
                            {emailSending === r.id ? "..." : "Email"}
                          </button>
                        )}
                        <button onClick={() => sendWaNotif(r.id)} disabled={waSending === r.id} className="admin-btn-wa-sm">
                          {waSending === r.id ? "..." : "WA"}
                        </button>
                        <button onClick={() => deleteRegistration(r.id)} className="admin-btn-danger-sm">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {registrations.length === 0 && <div className="reg-empty">Tidak ada data pendaftaran</div>}
          </div>

          {/* Pagination */}
          <div className="reg-pagination">
            <span className="reg-page-info">Halaman {page} dari {totalPages} ({totalResults} data)</span>
            <div className="reg-page-btns">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="admin-page-btn">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="admin-page-btn">Selanjutnya</button>
            </div>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {detailData && (
        <div className="reg-modal-overlay" onClick={() => setDetailData(null)}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-draghandle" />
            <div className="reg-modal-header">
              <h2 className="reg-modal-title">Detail Pendaftaran</h2>
              <div className="reg-modal-header-actions">
                {detailData.email && (
                  <button onClick={() => sendEmailNotif(detailData.id)} disabled={emailSending === detailData.id} className="admin-btn-email-sm">
                    {emailSending === detailData.id ? "..." : "Kirim Email"}
                  </button>
                )}
                <button onClick={() => sendWaNotif(detailData.id)} disabled={waSending === detailData.id} className="admin-btn-wa-sm">
                  {waSending === detailData.id ? "..." : "Kirim WA"}
                </button>
                <button onClick={() => setDetailData(null)} className="reg-modal-close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <div className="reg-modal-body">
              {detailLoading ? (
                <div className="reg-modal-loading"><div className="admin-loading-spinner" />Memuat data...</div>
              ) : (
                <>
                  <div className="reg-modal-status">
                    <span className={`reg-badge reg-badge-${detailData.status}`}>{detailData.status === "pending" ? "Pending" : detailData.status === "accepted" ? "Diterima" : "Ditolak"}</span>
                    <span className="reg-modal-date">Terdaftar: {new Date(detailData.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <ModalSection title="Data Pribadi">
                    <ModalField label="Nama Lengkap" value={detailData.fullName} />
                    <ModalField label="Nama Panggilan" value={detailData.nickname || "-"} />
                    <ModalField label="Jenis Kelamin" value={detailData.gender === "L" ? "Laki-laki" : "Perempuan"} />
                    <ModalField label="Tempat, Tanggal Lahir" value={`${detailData.birthPlace}, ${new Date(detailData.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`} />
                    <ModalField label="Agama" value={detailData.religion || "-"} />
                  </ModalSection>
                  <ModalSection title="Kontak & Sekolah">
                    <ModalField label="WhatsApp" value={detailData.whatsapp} />
                    <ModalField label="Email" value={detailData.email || "-"} />
                    <ModalField label="Alamat" value={detailData.address} />
                    <ModalField label="Kota" value={detailData.city || "-"} />
                    <ModalField label="Provinsi" value={detailData.province || "-"} />
                    <ModalField label="Kode Pos" value={detailData.postalCode || "-"} />
                    <ModalField label="Kelas" value={detailData.class} />
                    <ModalField label="Jurusan" value={detailData.major} />
                    <ModalField label="Golongan Darah" value={detailData.bloodType || "-"} />
                  </ModalSection>
                  {detailData.medicalHistory && <ModalSection title="Riwayat Medis"><p className="reg-modal-text">{detailData.medicalHistory}</p></ModalSection>}
                  <ModalSection title="Motivasi"><p className="reg-modal-text">{detailData.motivation}</p></ModalSection>
                  {detailData.organizationExperience && <ModalSection title="Pengalaman Organisasi"><p className="reg-modal-text">{detailData.organizationExperience}</p></ModalSection>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 className="reg-modal-section-title">{title}</h3>
      <div className="reg-modal-section">{children}</div>
    </div>
  )
}
function ModalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="reg-modal-field">
      <span className="reg-modal-field-label">{label}</span>
      <span className="reg-modal-field-value">{value}</span>
    </div>
  )
}

const adminCss = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes dashCross1 { 0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.08}33%{transform:translate3d(8px,-5px,0) rotate(5deg);opacity:.15}66%{transform:translate3d(-3px,8px,0) rotate(-3deg);opacity:.1} }
@keyframes navGlowPulse { 0%,100%{opacity:.5}50%{opacity:1} }
@keyframes navLogoFloat3D { 0%,100%{transform:translateZ(0) rotateY(0) rotateX(0)}25%{transform:translateZ(5px) rotateY(5deg) rotateX(2deg)}50%{transform:translateZ(0) rotateY(0) rotateX(0)}75%{transform:translateZ(-5px) rotateY(-5deg) rotateX(-2deg)} }
@keyframes menuSlideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
@keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes dashPulse { 0%,100%{box-shadow:0 0 20px rgba(220,38,38,.08)}50%{box-shadow:0 0 30px rgba(220,38,38,.15)} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.admin-page{min-height:100vh;background:#0A0A0B;font-family:'Plus Jakarta Sans',system-ui,sans-serif;position:relative;overflow-x:hidden}
.admin-loading{min-height:100vh;background:#0A0A0B;display:flex;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,.5);font-size:15px}
.admin-loading-spinner{width:20px;height:20px;border:2px solid rgba(220,38,38,.3);border-top-color:#DC2626;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0}
.admin-cross{position:absolute;z-index:0}
.cross-h{position:absolute;width:100%;height:2px;background:linear-gradient(90deg,transparent,#DC2626,transparent);top:50%;transform:translateY(-50%);border-radius:2px}
.cross-v{position:absolute;height:100%;width:2px;background:linear-gradient(180deg,transparent,#DC2626,transparent);left:50%;transform:translateX(-50%);border-radius:2px}

/* NAV */
.admin-nav{background:rgba(10,10,11,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;z-index:50}
.admin-nav-inner{max-width:1200px;margin:0 auto;padding:0 16px;display:flex;justify-content:space-between;align-items:center;height:60px}
.admin-nav-left{display:flex;align-items:center;gap:8px;min-width:0}
.admin-back-link{display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.5);font-size:12px;text-decoration:none;padding:5px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.08);transition:all .3s;flex-shrink:0}
.admin-back-link:hover{background:rgba(255,255,255,.06);color:#fff}
.admin-back-text{display:none}
.admin-divider{width:1px;height:20px;background:rgba(255,255,255,.08);flex-shrink:0}
.admin-logos{display:flex;align-items:center;gap:4px;flex-shrink:0}
.admin-logo-wrap{position:relative;width:28px;height:28px}
.admin-logo{width:28px;height:28px;border-radius:50%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(220,38,38,.3))}
.admin-nav-title{display:flex;flex-direction:column;min-width:0}
.admin-brand{font-family:'Sansita',Georgia,serif;font-size:13px;font-weight:700;background:linear-gradient(90deg,#EF4444,#DC2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap}
.admin-time{font-size:10px;color:rgba(255,255,255,.35);font-family:monospace;line-height:1}
.admin-nav-links-desktop{display:flex;align-items:center;gap:6px}
.admin-nav-link{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;color:rgba(255,255,255,.6);font-size:12px;font-weight:500;text-decoration:none;border:1px solid transparent;transition:all .3s;background:none;cursor:pointer;font-family:inherit}
.admin-nav-link:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff}
.admin-logout-btn:hover{background:rgba(220,38,38,.1)!important;border-color:rgba(220,38,38,.3)!important;color:#EF4444!important}
.admin-home-link{color:rgba(255,255,255,.5)!important;border-color:rgba(255,255,255,.08)!important}
.admin-home-link:hover{background:rgba(52,211,153,.1)!important;border-color:rgba(52,211,153,.3)!important;color:#34D399!important}
.admin-hamburger{display:none;background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;color:rgba(255,255,255,.7);cursor:pointer;transition:all .3s}
.admin-hamburger:hover{background:rgba(255,255,255,.06);color:#fff}
.admin-mobile-menu{display:none;flex-direction:column;padding:8px 16px 16px;gap:4px;animation:menuSlideDown .2s ease}
.admin-mobile-link{display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:10px;color:rgba(255,255,255,.7);font-size:14px;font-weight:500;text-decoration:none;border:1px solid rgba(255,255,255,.06);transition:all .3s;background:rgba(255,255,255,.03);cursor:pointer;font-family:inherit}
.admin-mobile-link:active{background:rgba(255,255,255,.08)}
.admin-mobile-link.admin-logout-btn{color:#EF4444;border-color:rgba(220,38,38,.15);background:rgba(220,38,38,.05)}

/* MAIN */
.admin-main{max-width:1200px;margin:0 auto;padding:16px;position:relative;z-index:1}
.admin-card{background:rgba(20,20,22,.8);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.08);animation:dashPulse 4s ease-in-out infinite}

/* INPUTS */
.admin-input{padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;outline:none;font-family:inherit;transition:border-color .3s,box-shadow .3s;width:100%}
.admin-input:focus{border-color:rgba(220,38,38,.5);box-shadow:0 0 15px rgba(220,38,38,.15)}
.admin-input::placeholder{color:rgba(255,255,255,.3)}
.admin-select{padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:12px;outline:none;font-family:inherit;cursor:pointer;appearance:auto;min-width:0}
.admin-select:focus{border-color:rgba(220,38,38,.5)}
.admin-select option{background:#1a1a1c;color:#fff}
.admin-select-sm{padding:6px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:11px;outline:none;font-family:inherit;cursor:pointer;appearance:auto}
.admin-select-sm option{background:#1a1a1c;color:#fff}
.admin-checkbox{accent-color:#DC2626;width:16px;height:16px}

/* BUTTONS */
.admin-btn-primary{padding:10px 18px;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;flex-shrink:0}
.admin-btn-primary:hover{box-shadow:0 0 20px rgba(220,38,38,.3);transform:translateY(-1px)}
.admin-btn-filter{display:flex;align-items:center;gap:5px;padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.6);font-size:12px;font-weight:500;cursor:pointer;transition:all .3s;font-family:inherit;flex-shrink:0}
.admin-btn-filter:hover{background:rgba(255,255,255,.08);color:#fff}
.admin-btn-filter-active{background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.3);color:#EF4444}
.admin-btn-clear{display:flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;color:rgba(239,68,68,.7);font-size:11px;cursor:pointer;transition:all .2s;font-family:inherit;margin-top:8px}
.admin-btn-clear:hover{background:rgba(239,68,68,.15);color:#EF4444}
.admin-btn-danger-sm{padding:6px 12px;background:rgba(239,68,68,.15);color:#EF4444;border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.admin-btn-danger-sm:active{transform:scale(.95)}
.admin-btn-success-sm{padding:6px 12px;background:rgba(52,211,153,.15);color:#34D399;border:1px solid rgba(52,211,153,.3);border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;display:inline-block;transition:all .2s}
.admin-btn-success-sm:active{transform:scale(.95)}
.admin-btn-blue-sm{padding:6px 12px;background:rgba(96,165,250,.15);color:#60A5FA;border:1px solid rgba(96,165,250,.3);border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;transition:all .2s;font-family:inherit}
.admin-btn-blue-sm:active{transform:scale(.95)}
.admin-btn-email-sm{padding:6px 12px;background:rgba(168,85,247,.15);color:#A855F7;border:1px solid rgba(168,85,247,.3);border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.admin-btn-email-sm:disabled{opacity:.5;cursor:not-allowed}
.admin-btn-email-sm:active{transform:scale(.95)}
.admin-btn-wa-sm{padding:6px 12px;background:rgba(37,211,102,.15);color:#25D366;border:1px solid rgba(37,211,102,.3);border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.admin-btn-wa-sm:disabled{opacity:.5;cursor:not-allowed}
.admin-btn-wa-sm:active{transform:scale(.95)}
.admin-page-btn{padding:8px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.6);font-size:12px;cursor:pointer;transition:all .2s;font-family:inherit}
.admin-page-btn:disabled{opacity:.3;cursor:not-allowed}
.admin-page-btn:not(:disabled):active{background:rgba(255,255,255,.1)}

/* REG FILTERS */
.reg-filters{padding:16px;border-bottom:1px solid rgba(255,255,255,.06)}
.reg-search-row{display:flex;gap:8px;margin-bottom:10px}
.reg-filter-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.reg-advanced-filters{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}
.reg-advanced-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.reg-date-range{display:flex;align-items:center;gap:6px}
.reg-date-separator{color:rgba(255,255,255,.3);font-size:12px}
.reg-filter-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}
.reg-result-count{font-size:12px;color:rgba(255,255,255,.4)}
.reg-filter-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}

/* REG MOBILE LIST */
.reg-mobile-list{display:none}

/* TABLE */
.reg-desktop-table{overflow-x:auto}
.admin-table{width:100%;border-collapse:collapse}
.admin-th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}
.admin-td{padding:12px 16px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.admin-td-bold{font-weight:600;color:#fff}
.admin-td-muted{color:rgba(255,255,255,.5)}
.admin-tr:hover{background:rgba(255,255,255,.03)}
.reg-action-btns{display:flex;gap:6px;align-items:center;white-space:nowrap}

/* BADGES */
.reg-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
.reg-badge-pending{background:rgba(252,211,77,.15);color:#FCD34D;border:1px solid rgba(252,211,77,.3)}
.reg-badge-accepted{background:rgba(52,211,153,.15);color:#34D399;border:1px solid rgba(52,211,153,.3)}
.reg-badge-rejected{background:rgba(239,68,68,.15);color:#EF4444;border:1px solid rgba(239,68,68,.3)}

/* PAGINATION */
.reg-pagination{padding:14px 16px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between}
.reg-page-info{font-size:12px;color:rgba(255,255,255,.4)}
.reg-page-btns{display:flex;gap:8px}
.reg-empty{padding:40px 16px;text-align:center;color:rgba(255,255,255,.3);font-size:13px}

/* MODAL */
.reg-modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);padding:0}
.reg-modal{background:rgba(20,20,22,.95);backdrop-filter:blur(24px);border-radius:20px 20px 0 0;border:1px solid rgba(220,38,38,.2);width:100%;max-height:92vh;overflow:hidden;box-shadow:0 0 40px rgba(220,38,38,.08),0 -10px 40px rgba(0,0,0,.5);animation:modalIn .3s ease;display:flex;flex-direction:column}
.reg-modal-draghandle{display:none}
.reg-modal-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.reg-modal-header-actions{display:flex;align-items:center;gap:8px}
.reg-modal-title{font-family:'Sansita',Georgia,serif;font-size:17px;font-weight:700;color:#fff}
.reg-modal-close{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;cursor:pointer;color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;width:32px;height:32px;transition:all .2s}
.reg-modal-close:hover{background:rgba(239,68,68,.15);color:#EF4444}
.reg-modal-body{padding:20px;overflow-y:auto;flex:1}
.reg-modal-loading{text-align:center;padding:40px;color:rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;gap:10px}
.reg-modal-status{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.reg-modal-date{font-size:11px;color:rgba(255,255,255,.35)}
.reg-modal-section-title{font-size:11px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.reg-modal-section{background:rgba(255,255,255,.03);border-radius:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.05)}
.reg-modal-field{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);gap:8px}
.reg-modal-field:last-child{border-bottom:none;padding-bottom:0}
.reg-modal-field-label{font-size:12px;color:rgba(255,255,255,.4);flex-shrink:0}
.reg-modal-field-value{font-size:12px;font-weight:600;color:#fff;text-align:right;word-break:break-word}
.reg-modal-text{color:rgba(255,255,255,.6);font-size:12px;line-height:1.7;white-space:pre-wrap;margin:0}

@media(min-width:640px){
  .admin-nav-inner{padding:0 24px;height:68px}
  .admin-back-text{display:inline}
  .admin-logo-wrap{width:32px;height:32px}
  .admin-logo{width:32px;height:32px}
  .admin-brand{font-size:15px}
  .admin-time{font-size:11px}
  .admin-main{padding:24px}
  .reg-filters{padding:20px 24px}
  .admin-th,.admin-td{padding:14px 20px}
  .reg-pagination{padding:16px 24px}
  .reg-modal-overlay{align-items:center;padding:16px}
  .reg-modal{border-radius:20px;max-height:85vh}
  .reg-modal-header{padding:20px 24px}
  .reg-modal-body{padding:24px}
  .reg-advanced-row{flex-wrap:nowrap}
  .reg-date-range{flex:1}
  .reg-date-range .admin-input{width:auto;flex:1}
}

@media(min-width:768px){
  .admin-hamburger{display:none!important}
  .admin-mobile-menu{display:none!important}
  .admin-nav-links-desktop{display:flex!important}
}

@media(max-width:767px){
  .admin-nav-links-desktop{display:none}
  .admin-hamburger{display:flex}
  .admin-mobile-menu{display:flex}
  .reg-desktop-table{display:none}
  .reg-mobile-list{display:flex;flex-direction:column;gap:0}
  .reg-mobile-card{padding:16px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);transition:background .2s}
  .reg-mobile-card:active{background:rgba(255,255,255,.05)}
  .reg-mobile-card:last-child{border-bottom:none}
  .reg-mobile-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
  .reg-mobile-idx{font-size:11px;font-weight:700;color:rgba(220,38,38,.6);background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.2);border-radius:6px;padding:2px 7px;flex-shrink:0;line-height:1}
  .reg-mobile-name{font-size:15px;font-weight:700;color:#fff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .reg-mobile-fields{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding:12px;background:rgba(255,255,255,.03);border-radius:10px;border:1px solid rgba(255,255,255,.04)}
  .reg-mobile-field{display:flex;justify-content:space-between;font-size:13px;gap:8px}
  .reg-mobile-field span:first-child{color:rgba(255,255,255,.4);flex-shrink:0}
  .reg-mobile-field span:last-child{color:rgba(255,255,255,.8);text-align:right;word-break:break-word;font-weight:500}
  .reg-mobile-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .reg-mobile-actions .admin-select-sm{flex:1;padding:10px 12px;font-size:12px;border-radius:10px}
  .reg-mobile-actions .admin-btn-blue-sm,.reg-mobile-actions .admin-btn-danger-sm,.reg-mobile-actions .admin-btn-email-sm,.reg-mobile-actions .admin-btn-wa-sm{flex:1;padding:10px 12px;font-size:12px;text-align:center;border-radius:10px}
  .reg-filter-row{flex-direction:column;align-items:stretch}
  .reg-filter-row .admin-select{width:100%;padding:12px;font-size:13px}
  .reg-advanced-row{flex-direction:column;align-items:stretch}
  .reg-advanced-row .admin-select{width:100%;padding:12px;font-size:13px}
  .reg-date-range{width:100%}
  .reg-date-range .admin-input{flex:1;padding:12px;font-size:13px}
  .reg-date-separator{font-size:13px}
  .reg-filter-footer{flex-direction:column;gap:10px;align-items:stretch}
  .reg-filter-actions{justify-content:stretch;gap:8px}
  .reg-filter-actions a,.reg-filter-actions button{flex:1;text-align:center;padding:10px 12px;font-size:12px;border-radius:10px}
  .reg-page-btns{gap:8px}
  .reg-page-btns button{flex:1;padding:12px;font-size:13px}
  .reg-pagination{padding:16px;flex-direction:column;gap:12px;text-align:center}
  .reg-page-btns{width:100%}
  .reg-modal-overlay{align-items:flex-end;padding:0}
  .reg-modal{border-radius:20px 20px 0 0;max-height:95vh}
  .reg-modal-draghandle{display:block;width:40px;height:4px;background:rgba(255,255,255,.2);border-radius:4px;margin:12px auto 0}
  .reg-modal-header{padding:16px 20px}
  .reg-modal-title{font-size:16px}
  .reg-modal-body{padding:16px 20px}
  .reg-modal-field{flex-direction:column;gap:4px;padding:10px 0}
  .reg-modal-field-value{text-align:left;font-size:13px}
  .reg-modal-field-label{font-size:12px}
  .reg-modal-section{padding:14px}
  .reg-filters{padding:14px}
  .reg-search-row{gap:10px}
  .admin-input{padding:12px 14px;font-size:14px}
  .admin-btn-primary{padding:12px 20px;font-size:14px}
  .reg-empty{padding:60px 20px;font-size:14px}
}

@media(max-width:380px){
  .admin-nav-inner{height:56px;padding:0 12px}
  .admin-logo-wrap{width:24px;height:24px}
  .admin-logo{width:24px;height:24px}
  .admin-brand{font-size:12px}
  .admin-main{padding:12px}
  .reg-filters{padding:12px}
  .admin-input{padding:10px 12px;font-size:13px}
  .reg-mobile-card{padding:14px}
  .reg-mobile-idx{font-size:10px;padding:2px 6px}
  .reg-mobile-name{font-size:14px}
  .reg-mobile-fields{padding:10px}
  .reg-mobile-field{font-size:12px}
  .reg-mobile-actions .admin-select-sm,.reg-mobile-actions .admin-btn-blue-sm,.reg-mobile-actions .admin-btn-danger-sm,.reg-mobile-actions .admin-btn-email-sm,.reg-mobile-actions .admin-btn-wa-sm{padding:9px 10px;font-size:11px}
  .reg-badge{font-size:10px;padding:3px 10px}
  .reg-page-btns button{padding:10px;font-size:12px}
}
`
