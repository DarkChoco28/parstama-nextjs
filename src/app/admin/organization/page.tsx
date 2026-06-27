"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OrgMember {
  id: string
  name: string
  nickname?: string
  position: string
  division?: string
  divisionDesc?: string
  bio?: string
  photo?: string
  level: number
  parentId?: string
  sortOrder: number
  period?: string
  isVisible: boolean
}

const defaultForm = { name: "", nickname: "", position: "", division: "", divisionDesc: "", bio: "", photo: "", level: 0, parentId: "", sortOrder: 0, period: "", isVisible: true }

export default function AdminOrganization() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    update(); const i = setInterval(update, 1000); return () => clearInterval(i)
  }, [])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch("/api/admin/organization"); const d = await r.json(); setMembers(d.members || d || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status === "authenticated") fetchMembers() }, [status, fetchMembers])

  const openAdd = () => { setEditingMember(null); setForm(defaultForm); setShowForm(true) }
  const openEdit = (m: OrgMember) => { setEditingMember(m); setForm({ name: m.name, nickname: m.nickname || "", position: m.position, division: m.division || "", divisionDesc: m.divisionDesc || "", bio: m.bio || "", photo: m.photo || "", level: m.level, parentId: m.parentId || "", sortOrder: m.sortOrder, period: m.period || "", isVisible: m.isVisible }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditingMember(null); setForm(defaultForm) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.position.trim()) return alert("Nama dan Posisi wajib diisi")
    setSaving(true)
    try {
      const body = { ...form, level: Number(form.level), sortOrder: Number(form.sortOrder), parentId: form.parentId || undefined }
      const url = editingMember ? `/api/admin/organization/${editingMember.id}` : "/api/admin/organization"
      const method = editingMember ? "PUT" : "POST"
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (r.ok) { closeForm(); fetchMembers() } else { const d = await r.json(); alert(d.error || "Gagal menyimpan") }
    } catch (e) { console.error(e); alert("Terjadi kesalahan") } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try { const r = await fetch(`/api/admin/organization/${id}`, { method: "DELETE" }); if (r.ok) { setDeleteConfirm(null); fetchMembers() } }
    catch (e) { console.error(e) }
  }

  const toggleVisibility = async (m: OrgMember) => {
    try { await fetch(`/api/admin/organization/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !m.isVisible }) }); fetchMembers() }
    catch (e) { console.error(e) }
  }

  const moveOrder = async (m: OrgMember, dir: -1 | 1) => {
    try { await fetch(`/api/admin/organization/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: m.sortOrder + dir }) }); fetchMembers() }
    catch (e) { console.error(e) }
  }

  if (status === "loading" || loading) {
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat data...</span><style>{adminCss}</style></div>)
  }
  if (!session) return null

  const grouped = [0, 1, 2].map(lvl => ({ level: lvl, label: lvl === 0 ? "Pimpinan Utama" : lvl === 1 ? "Kepala Divisi" : "Staff", members: members.filter(m => m.level === lvl).sort((a, b) => a.sortOrder - b.sortOrder) }))
  const levelOptions = [
    { value: 0, label: "Pimpinan Utama" },
    { value: 1, label: "Kepala Divisi" },
    { value: 2, label: "Staff" },
  ]

  const navLinks = [
    { href: "/admin/registrations", label: "Pendaftaran", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { href: "/admin/profile", label: "Profile", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { href: "/admin/register", label: "+ Admin", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
  ]

  return (
    <div className="admin-page">
      <style>{adminCss}</style>

      <div className="admin-cross" style={{ top: "10%", right: "5%", width: 20, height: 20, animation: "dashCross1 9s ease-in-out infinite" }}>
        <div className="cross-h" /><div className="cross-v" />
      </div>
      <div className="admin-cross" style={{ bottom: "15%", left: "8%", width: 16, height: 16, animation: "dashCross2 11s ease-in-out infinite 2s" }}>
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
              <div className="admin-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/smkn_logo.png" alt="SMKN" className="admin-logo" />
              </div>
              <div className="admin-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/parstama_logo.png" alt="PARSTAMA" className="admin-logo" />
              </div>
            </div>
            <div className="admin-nav-title">
              <span className="admin-brand">Organisasi</span>
              <span className="admin-time">{currentTime}</span>
            </div>
          </div>
          <div className="admin-nav-links-desktop">
            <Link href="/" className="admin-nav-link admin-home-link"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Website</Link>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="admin-nav-link">{l.icon}{l.label}</Link>
            ))}
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
            <Link href="/admin/registrations" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Pendaftaran</Link>
            <Link href="/admin/profile" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile</Link>
            <Link href="/admin/register" className="admin-mobile-link" onClick={() => setMenuOpen(false)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>+ Admin</Link>
            <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false) }} className="admin-mobile-link admin-logout-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Logout</button>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-row">
            <div>
              <h2 className="admin-title">Struktur Organisasi</h2>
              <p className="admin-subtitle">Kelola anggota organisasi PARSTAMA</p>
            </div>
            <button onClick={openAdd} className="admin-btn-add">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Tambah Anggota
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="org-summary">
          {levelOptions.map(l => (
            <div key={l.value} className="org-summary-card">
              <span className="org-summary-count">{members.filter(m => m.level === l.value).length}</span>
              <span className="org-summary-label">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Groups */}
        {grouped.map(g => (
          <div key={g.level} className="org-group">
            <h3 className="org-group-title">
              <span className={`org-level-dot org-level-${g.level}`} />
              {g.label}
            </h3>
            {g.members.length === 0 ? (
              <div className="org-empty">Belum ada anggota di level ini</div>
            ) : (
              <div className="org-member-grid">
                {g.members.map(m => (
                  <div key={m.id} className={`org-member-card ${!m.isVisible ? "org-member-hidden" : ""}`}>
                    <div className="org-member-top">
                      <div className="org-member-info">
                        <span className="org-member-name">{m.name}{m.nickname ? ` (${m.nickname})` : ""}</span>
                        <span className="org-member-position">{m.position}</span>
                      </div>
                      <div className={`org-vis-badge ${m.isVisible ? "org-vis-on" : "org-vis-off"}`}>
                        {m.isVisible ? "Tampil" : "Sembunyi"}
                      </div>
                    </div>
                    {m.division && <div className="org-member-division">{m.division}</div>}
                    {m.period && <div className="org-member-period">{m.period}</div>}
                    <div className="org-member-actions">
                      <button onClick={() => moveOrder(m, -1)} className="org-action-btn" title="Naikkan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg></button>
                      <button onClick={() => moveOrder(m, 1)} className="org-action-btn" title="Turunkan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button>
                      <button onClick={() => toggleVisibility(m)} className={`org-action-btn ${m.isVisible ? "org-vis-toggle-on" : "org-vis-toggle-off"}`} title={m.isVisible ? "Sembunyikan" : "Tampilkan"}>
                        {m.isVisible ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
                      </button>
                      <button onClick={() => openEdit(m)} className="org-action-btn org-action-edit" title="Edit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      {deleteConfirm === m.id ? (
                        <div className="org-delete-confirm">
                          <span>Hapus?</span>
                          <button onClick={() => handleDelete(m.id)} className="org-del-yes">Ya</button>
                          <button onClick={() => setDeleteConfirm(null)} className="org-del-no">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(m.id)} className="org-action-btn org-action-delete" title="Hapus"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* FORM MODAL */}
      {showForm && (
        <div className="org-modal-overlay" onClick={closeForm}>
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <div className="org-modal-draghandle" />
            <div className="org-modal-header">
              <h2 className="org-modal-title">{editingMember ? "Edit Anggota" : "Tambah Anggota"}</h2>
              <button onClick={closeForm} className="org-modal-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
            </div>
            <div className="org-modal-body">
              <div className="org-form-group">
                <label className="org-label">Nama <span className="org-required">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="Nama lengkap" />
              </div>
              <div className="org-form-group">
                <label className="org-label">Nama Panggilan</label>
                <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="admin-input" placeholder="Nama panggilan (opsional)" />
              </div>
              <div className="org-form-group">
                <label className="org-label">Posisi <span className="org-required">*</span></label>
                <input type="text" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="admin-input" placeholder="Ketua, Sekretaris, dll." />
              </div>
              <div className="org-form-group">
                <label className="org-label">Divisi</label>
                <input type="text" value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} className="admin-input" placeholder="Bidang Keorganisasian, dll." />
              </div>
              <div className="org-form-group">
                <label className="org-label">Deskripsi Divisi</label>
                <textarea value={form.divisionDesc} onChange={e => setForm({ ...form, divisionDesc: e.target.value })} className="admin-input" rows={2} placeholder="Penjelasan singkat tentang divisi ini..." style={{ resize: "vertical" }} />
              </div>
              <div className="org-form-group">
                <label className="org-label">Bio / Deskripsi Diri</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="admin-input" rows={3} placeholder="Cerita singkat tentang anggota ini..." style={{ resize: "vertical" }} />
              </div>
              <div className="org-form-group">
                <label className="org-label">Foto (URL)</label>
                <input type="url" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="admin-input" placeholder="https://example.com/foto.jpg" />
                {form.photo && (
                  <div style={{ marginTop: 8, width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photo} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
              <div className="org-form-row">
                <div className="org-form-group" style={{ flex: 1 }}>
                  <label className="org-label">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: Number(e.target.value) })} className="admin-select" style={{ width: "100%" }}>
                    {levelOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="org-form-group" style={{ flex: 1 }}>
                  <label className="org-label">Urutan</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="admin-input" min="0" />
                </div>
              </div>
              <div className="org-form-group">
                <label className="org-label">Parent (Atasan)</label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="admin-select" style={{ width: "100%" }}>
                  <option value="">Tanpa atasan</option>
                  {members.filter(m => m.id !== editingMember?.id).map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                </select>
              </div>
              <div className="org-form-group">
                <label className="org-label">Periode</label>
                <input type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="admin-input" placeholder="2025-2026" />
              </div>
              <div className="org-form-group">
                <label className="org-check-label">
                  <input type="checkbox" checked={form.isVisible} onChange={e => setForm({ ...form, isVisible: e.target.checked })} className="admin-checkbox" />
                  Tampilkan di halaman publik
                </label>
              </div>
              <div className="org-form-actions">
                <button onClick={closeForm} className="org-btn-cancel">Batal</button>
                <button onClick={handleSave} disabled={saving} className="admin-btn-primary">{saving ? "Menyimpan..." : editingMember ? "Simpan Perubahan" : "Tambahkan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const adminCss = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes dashCross1 { 0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.08}33%{transform:translate3d(8px,-5px,0) rotate(5deg);opacity:.15}66%{transform:translate3d(-3px,8px,0) rotate(-3deg);opacity:.1} }
@keyframes dashCross2 { 0%,100%{transform:translate3d(0,0,0) rotate(0deg);opacity:.06}33%{transform:translate3d(-6px,7px,0) rotate(-4deg);opacity:.12}66%{transform:translate3d(5px,-4px,0) rotate(6deg);opacity:.08} }
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
.admin-header{margin-bottom:20px}
.admin-header-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.admin-title{font-family:'Sansita',Georgia,serif;font-size:22px;font-weight:700;background:linear-gradient(90deg,#EF4444,#DC2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.admin-subtitle{color:rgba(255,255,255,.4);font-size:13px;margin-top:4px}

/* INPUTS */
.admin-input{padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;outline:none;font-family:inherit;transition:border-color .3s,box-shadow .3s;width:100%}
.admin-input:focus{border-color:rgba(220,38,38,.5);box-shadow:0 0 15px rgba(220,38,38,.15)}
.admin-input::placeholder{color:rgba(255,255,255,.3)}
.admin-select{padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:12px;outline:none;font-family:inherit;cursor:pointer;appearance:auto;min-width:0}
.admin-select:focus{border-color:rgba(220,38,38,.5)}
.admin-select option{background:#1a1a1c;color:#fff}
.admin-checkbox{accent-color:#DC2626;width:16px;height:16px}
.admin-btn-primary{padding:10px 18px;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;flex-shrink:0}
.admin-btn-primary:hover{box-shadow:0 0 20px rgba(220,38,38,.3);transform:translateY(-1px)}
.admin-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* ADD BUTTON */
.admin-btn-add{display:flex;align-items:center;gap:6px;padding:10px 18px;background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;white-space:nowrap}
.admin-btn-add:hover{box-shadow:0 0 20px rgba(220,38,38,.3);transform:translateY(-1px)}

/* SUMMARY */
.org-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.org-summary-card{background:rgba(20,20,22,.8);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center;display:flex;flex-direction:column;gap:4px}
.org-summary-count{font-size:24px;font-weight:800;color:#fff}
.org-summary-label{font-size:11px;color:rgba(255,255,255,.4);font-weight:500}

/* GROUPS */
.org-group{margin-bottom:24px}
.org-group-title{font-family:'Sansita',Georgia,serif;font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;margin-bottom:12px}
.org-level-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.org-level-0{background:#EF4444}
.org-level-1{background:#F59E0B}
.org-level-2{background:#3B82F6}
.org-empty{padding:24px;text-align:center;color:rgba(255,255,255,.3);font-size:13px;background:rgba(20,20,22,.5);border-radius:12px;border:1px dashed rgba(255,255,255,.1)}

/* MEMBER CARDS */
.org-member-grid{display:grid;grid-template-columns:1fr;gap:10px}
.org-member-card{background:rgba(20,20,22,.8);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;transition:all .3s}
.org-member-card:hover{border-color:rgba(220,38,38,.2);box-shadow:0 0 20px rgba(220,38,38,.05)}
.org-member-hidden{opacity:.45}
.org-member-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px}
.org-member-info{display:flex;flex-direction:column;gap:2px;min-width:0}
.org-member-name{font-size:14px;font-weight:700;color:#fff;line-height:1.3}
.org-member-position{font-size:12px;color:rgba(255,255,255,.5);font-weight:500}
.org-member-division{font-size:11px;color:rgba(255,255,255,.35);margin-bottom:4px;padding:4px 8px;background:rgba(255,255,255,.03);border-radius:6px;display:inline-block}
.org-member-period{font-size:11px;color:rgba(255,255,255,.3);margin-bottom:8px;font-family:monospace}
.org-vis-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;flex-shrink:0;white-space:nowrap}
.org-vis-on{background:rgba(52,211,153,.15);color:#34D399;border:1px solid rgba(52,211,153,.3)}
.org-vis-off{background:rgba(239,68,68,.1);color:#EF4444;border:1px solid rgba(239,68,68,.2)}

/* MEMBER ACTIONS */
.org-member-actions{display:flex;gap:4px;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);margin-top:6px}
.org-action-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.5);cursor:pointer;transition:all .2s;padding:0}
.org-action-btn:hover{background:rgba(255,255,255,.1);color:#fff}
.org-action-edit:hover{background:rgba(96,165,250,.15);border-color:rgba(96,165,250,.3);color:#60A5FA}
.org-action-delete:hover{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#EF4444}
.org-vis-toggle-on:hover{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.3);color:#34D399}
.org-vis-toggle-off:hover{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.2);color:#EF4444}
.org-delete-confirm{display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,.5)}
.org-del-yes{padding:4px 8px;background:rgba(239,68,68,.2);color:#EF4444;border:1px solid rgba(239,68,68,.4);border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
.org-del-no{padding:4px 8px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.1);border-radius:6px;font-size:11px;cursor:pointer;font-family:inherit}

/* MODAL */
.org-modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);padding:0}
.org-modal{background:rgba(20,20,22,.95);backdrop-filter:blur(24px);border-radius:20px 20px 0 0;border:1px solid rgba(220,38,38,.2);width:100%;max-height:92vh;overflow:hidden;box-shadow:0 0 40px rgba(220,38,38,.08),0 -10px 40px rgba(0,0,0,.5);animation:modalIn .3s ease;display:flex;flex-direction:column}
.org-modal-draghandle{display:none}
.org-modal-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.org-modal-title{font-family:'Sansita',Georgia,serif;font-size:17px;font-weight:700;color:#fff}
.org-modal-close{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;cursor:pointer;color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;width:32px;height:32px;transition:all .2s}
.org-modal-close:hover{background:rgba(239,68,68,.15);color:#EF4444}
.org-modal-body{padding:20px;overflow-y:auto;flex:1}

/* FORM */
.org-form-group{margin-bottom:14px}
.org-form-row{display:flex;gap:12px}
.org-label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px}
.org-required{color:#EF4444}
.org-check-label{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,.6);cursor:pointer}
.org-form-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);margin-top:8px}
.org-btn-cancel{padding:10px 18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
.org-btn-cancel:hover{background:rgba(255,255,255,.08);color:#fff}

@media(min-width:640px){
  .admin-nav-inner{padding:0 24px;height:68px}
  .admin-back-text{display:inline}
  .admin-logo-wrap{width:32px;height:32px}
  .admin-logo{width:32px;height:32px}
  .admin-brand{font-size:15px}
  .admin-time{font-size:11px}
  .admin-main{padding:24px}
  .admin-title{font-size:28px}
  .org-member-grid{grid-template-columns:repeat(2,1fr)}
  .org-modal-overlay{align-items:center;padding:16px}
  .org-modal{border-radius:20px;max-height:85vh}
  .org-modal-header{padding:20px 24px}
  .org-modal-body{padding:24px}
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
  .admin-header-row{flex-direction:column}
  .admin-btn-add{width:100%;justify-content:center}
  .org-summary{grid-template-columns:repeat(3,1fr);gap:8px}
  .org-summary-card{padding:10px}
  .org-summary-count{font-size:20px}
  .org-summary-label{font-size:10px}
  .org-modal-overlay{align-items:flex-end;padding:0}
  .org-modal{border-radius:20px 20px 0 0;max-height:95vh}
  .org-modal-draghandle{display:block;width:40px;height:4px;background:rgba(255,255,255,.2);border-radius:4px;margin:12px auto 0}
  .org-modal-header{padding:16px 20px}
  .org-modal-title{font-size:16px}
  .org-modal-body{padding:16px 20px}
  .org-form-row{flex-direction:column;gap:0}
  .org-member-card{padding:12px}
  .admin-input{padding:12px 14px;font-size:14px}
  .admin-btn-add{padding:12px 20px;font-size:14px}
}

@media(max-width:380px){
  .admin-nav-inner{height:56px;padding:0 12px}
  .admin-logo-wrap{width:24px;height:24px}
  .admin-logo{width:24px;height:24px}
  .admin-brand{font-size:12px}
  .admin-main{padding:12px}
  .org-summary{gap:6px}
  .org-summary-card{padding:8px}
  .org-summary-count{font-size:18px}
  .org-summary-label{font-size:9px}
  .org-group-title{font-size:14px}
  .org-member-name{font-size:13px}
  .org-modal-body{padding:14px 16px}
}
`
