"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
  const [showFilters, setShowFilters] = useState(false)
  const [emailSending, setEmailSending] = useState<string | null>(null)
  const [waSending, setWaSending] = useState<string | null>(null)
  const [confirmSending, setConfirmSending] = useState<string | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

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

  const sendConfirmNotif = async (registrationId: string) => {
    setConfirmSending(registrationId)
    try {
      const r = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      })
      const d = await r.json()
      if (r.ok) alert("Email konfirmasi berhasil dikirim!")
      else alert(d.error || "Gagal mengirim email konfirmasi")
    } catch (e) { console.error(e); alert("Gagal mengirim email konfirmasi") }
    finally { setConfirmSending(null) }
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
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat data...</span></div>)
  }
  if (!session) return null

  return (
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
                    <>
                      <button onClick={() => sendConfirmNotif(r.id)} disabled={confirmSending === r.id} className="admin-btn-orange-sm">
                        {confirmSending === r.id ? "..." : "Konfirmasi"}
                      </button>
                      <button onClick={() => sendEmailNotif(r.id)} disabled={emailSending === r.id} className="admin-btn-email-sm">
                        {emailSending === r.id ? "..." : "Email"}
                      </button>
                    </>
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
                          <>
                            <button onClick={() => sendConfirmNotif(r.id)} disabled={confirmSending === r.id} className="admin-btn-orange-sm">
                              {confirmSending === r.id ? "..." : "Konfirmasi"}
                            </button>
                            <button onClick={() => sendEmailNotif(r.id)} disabled={emailSending === r.id} className="admin-btn-email-sm">
                              {emailSending === r.id ? "..." : "Email"}
                            </button>
                          </>
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

      {/* DETAIL MODAL */}
      {detailData && (
        <div className="reg-modal-overlay" onClick={() => setDetailData(null)}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-draghandle" />
            <div className="reg-modal-header">
              <h2 className="reg-modal-title">Detail Pendaftaran</h2>
              <div className="reg-modal-header-actions">
                {detailData.email && (
                  <>
                    <button onClick={() => sendConfirmNotif(detailData.id)} disabled={confirmSending === detailData.id} className="admin-btn-orange-sm">
                      {confirmSending === detailData.id ? "..." : "Konfirmasi"}
                    </button>
                    <button onClick={() => sendEmailNotif(detailData.id)} disabled={emailSending === detailData.id} className="admin-btn-email-sm">
                      {emailSending === detailData.id ? "..." : "Kirim Email"}
                    </button>
                  </>
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
      </main>
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

