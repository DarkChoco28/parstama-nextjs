"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import ImageUpload from "@/components/admin/ImageUpload"

interface OrgMember {
  id: string
  name: string
  nickname?: string
  position: string
  bio?: string
  photo?: string
  level: number
  parentId?: string
  sortOrder: number
  period?: string
  isVisible: boolean
}

const defaultForm = { name: "", nickname: "", position: "", bio: "", photo: "", level: 0, parentId: "", sortOrder: 0, period: "", isVisible: true }

export default function AdminOrganization() {
  const { data: session, status } = useSession()
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch("/api/admin/organization"); const d = await r.json(); setMembers(d.members || d || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status === "authenticated") fetchMembers() }, [status, fetchMembers])

  const openAdd = () => { setEditingMember(null); setForm(defaultForm); setShowForm(true) }
  const openEdit = (m: OrgMember) => { setEditingMember(m); setForm({ name: m.name, nickname: m.nickname || "", position: m.position, bio: m.bio || "", photo: m.photo || "", level: m.level, parentId: m.parentId || "", sortOrder: m.sortOrder, period: m.period || "", isVisible: m.isVisible }); setShowForm(true) }
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
    return (<div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat data...</span></div>)
  }
  if (!session) return null

  const grouped = [0, 1, 2, 3].map(lvl => ({ level: lvl, label: lvl === 0 ? "Ketua Umum" : lvl === 1 ? "Ketua Satu" : lvl === 2 ? "Pengurus Inti" : "Humas", members: members.filter(m => m.level === lvl).sort((a, b) => a.sortOrder - b.sortOrder) }))
  const levelOptions = [
    { value: 0, label: "Ketua Umum" },
    { value: 1, label: "Ketua Satu" },
    { value: 2, label: "Pengurus Inti" },
    { value: 3, label: "Humas" },
  ]

  return (
    <>
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-row">
            <div>
              <h2 className="admin-title">Struktur Organisasi</h2>
              <p className="admin-subtitle">Kelola anggota organisasi PARSTAMA</p>
            </div>
            <div className="admin-header-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => window.open("/api/admin/organization/export")} className="admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7", cursor: "pointer", transition: "all 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export PDF
              </button>
              <button onClick={openAdd} className="admin-btn-add">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                Tambah Anggota
              </button>
            </div>
          </div>
        </div>

        <div className="org-summary">
          {levelOptions.map(l => (
            <div key={l.value} className="org-summary-card">
              <span className="org-summary-count">{members.filter(m => m.level === l.value).length}</span>
              <span className="org-summary-label">{l.label}</span>
            </div>
          ))}
        </div>

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

                    {m.period && <div className="org-member-period">{m.period}</div>}
                    <div className="org-member-actions">
                      <button onClick={() => moveOrder(m, -1)} className="org-action-btn" title="Naikkan" aria-label="Naikkan urutan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg></button>
                      <button onClick={() => moveOrder(m, 1)} className="org-action-btn" title="Turunkan" aria-label="Turunkan urutan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button>
                      <button onClick={() => toggleVisibility(m)} className={`org-action-btn ${m.isVisible ? "org-vis-toggle-on" : "org-vis-toggle-off"}`} title={m.isVisible ? "Sembunyikan" : "Tampilkan"} aria-label={m.isVisible ? "Sembunyikan" : "Tampilkan"}>
                        {m.isVisible ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
                      </button>
                      <button onClick={() => openEdit(m)} className="org-action-btn org-action-edit" title="Edit" aria-label="Edit anggota"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      {deleteConfirm === m.id ? (
                        <div className="org-delete-confirm">
                          <span>Hapus?</span>
                          <button onClick={() => handleDelete(m.id)} className="org-del-yes">Ya</button>
                          <button onClick={() => setDeleteConfirm(null)} className="org-del-no">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(m.id)} className="org-action-btn org-action-delete" title="Hapus" aria-label="Hapus anggota"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
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
              <button onClick={closeForm} className="org-modal-close" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
            </div>
            <div className="org-modal-body">
              <div className="org-form-group">
                <label className="org-label">Nama <span className="org-required">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="Nama lengkap" aria-label="Nama" />
              </div>
              <div className="org-form-group">
                <label className="org-label">Nama Panggilan</label>
                <input type="text" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="admin-input" placeholder="Nama panggilan (opsional)" aria-label="Nama Panggilan" />
              </div>
              <div className="org-form-group">
                <label className="org-label">Posisi <span className="org-required">*</span></label>
                <input type="text" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="admin-input" placeholder="Ketua, Sekretaris, dll." aria-label="Posisi" />
              </div>
              <div className="org-form-group">
                <label className="org-label">Bio / Deskripsi Diri</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="admin-input" rows={3} placeholder="Cerita singkat tentang anggota ini..." aria-label="Bio" style={{ resize: "vertical" }} />
              </div>
              <div className="org-form-group">
                <label className="org-label">Foto</label>
                <ImageUpload value={form.photo} onChange={url => setForm({ ...form, photo: url })} folder="organizations" label="Foto" />
              </div>
              <div className="org-form-row">
                <div className="org-form-group" style={{ flex: 1 }}>
                  <label className="org-label">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: Number(e.target.value) })} className="admin-select" aria-label="Level" style={{ width: "100%" }}>
                    {levelOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="org-form-group" style={{ flex: 1 }}>
                  <label className="org-label">Urutan</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="admin-input" min="0" aria-label="Urutan" />
                </div>
              </div>
              <div className="org-form-group">
                <label className="org-label">Parent (Atasan)</label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="admin-select" aria-label="Parent (Atasan)" style={{ width: "100%" }}>
                  <option value="">Tanpa atasan</option>
                  {members.filter(m => m.id !== editingMember?.id).map(m => <option key={m.id} value={m.id}>{m.name} - {m.position}</option>)}
                </select>
              </div>
              <div className="org-form-group">
                <label className="org-label">Periode</label>
                <input type="text" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="admin-input" placeholder="2025-2026" aria-label="Periode" />
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

      <style>{`
        .admin-header-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .admin-btn-add{display:flex;align-items:center;gap:6px;padding:10px 18px;background:linear-gradient(135deg,#E87A1A,#F97316);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all .3s;font-family:inherit;white-space:nowrap}
        .admin-btn-add:hover{box-shadow:0 0 20px rgba(232,122,26,.3);transform:translateY(-1px)}
        .org-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
        .org-summary-card{background:rgba(20,20,22,.8);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center;display:flex;flex-direction:column;gap:4px}
        .org-summary-count{font-size:24px;font-weight:800;color:#fff}
        .org-summary-label{font-size:11px;color:rgba(255,255,255,.4);font-weight:500}
        .org-group{margin-bottom:24px}
        .org-group-title{font-family:var(--font-sansita),Georgia,serif;font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;margin-bottom:12px}
        .org-level-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .org-level-0{background:#EF4444}
        .org-level-1{background:#F59E0B}
        .org-level-2{background:#3B82F6}
        .org-level-3{background:#8B5CF6}
        .org-empty{padding:24px;text-align:center;color:rgba(255,255,255,.3);font-size:13px;background:rgba(20,20,22,.5);border-radius:12px;border:1px dashed rgba(255,255,255,.1)}
        .org-member-grid{display:grid;grid-template-columns:1fr;gap:10px}
        .org-member-card{background:rgba(20,20,22,.8);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;transition:all .3s}
        .org-member-card:hover{border-color:rgba(232,122,26,.2);box-shadow:0 0 20px rgba(232,122,26,.05)}
        .org-member-hidden{opacity:.45}
        .org-member-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px}
        .org-member-info{display:flex;flex-direction:column;gap:2px;min-width:0}
        .org-member-name{font-size:14px;font-weight:700;color:#fff;line-height:1.3}
        .org-member-position{font-size:12px;color:rgba(255,255,255,.5);font-weight:500}

        .org-member-period{font-size:11px;color:rgba(255,255,255,.3);margin-bottom:8px;font-family:monospace}
        .org-vis-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;flex-shrink:0;white-space:nowrap}
        .org-vis-on{background:rgba(52,211,153,.15);color:#34D399;border:1px solid rgba(52,211,153,.3)}
        .org-vis-off{background:rgba(239,68,68,.1);color:#EF4444;border:1px solid rgba(239,68,68,.2)}
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
        .org-modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);padding:0}
        .org-modal{background:rgba(20,20,22,.95);backdrop-filter:blur(24px);border-radius:20px 20px 0 0;border:1px solid rgba(232,122,26,.2);width:100%;max-height:92vh;overflow:hidden;box-shadow:0 0 40px rgba(232,122,26,.08),0 -10px 40px rgba(0,0,0,.5);animation:modalIn .3s ease;display:flex;flex-direction:column}
        .org-modal-draghandle{display:none}
        .org-modal-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .org-modal-title{font-family:var(--font-sansita),Georgia,serif;font-size:17px;font-weight:700;color:#fff}
        .org-modal-close{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;cursor:pointer;color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;width:32px;height:32px;transition:all .2s}
        .org-modal-close:hover{background:rgba(239,68,68,.15);color:#EF4444}
        .org-modal-body{padding:20px;overflow-y:auto;flex:1}
        .org-form-group{margin-bottom:14px}
        .org-form-row{display:flex;gap:12px}
        .org-label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px}
        .org-required{color:#EF4444}
        .org-check-label{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,.6);cursor:pointer}
        .org-photo-row{display:flex;gap:8px}
        .org-photo-row .admin-input{flex:1}
        .org-upload-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(96,165,250,.15);color:#60A5FA;border:1px solid rgba(96,165,250,.3);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s;font-family:inherit;white-space:nowrap;flex-shrink:0}
        .org-upload-btn:hover{background:rgba(96,165,250,.25)}
        .org-form-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);margin-top:8px}
        .org-btn-cancel{padding:10px 18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .org-btn-cancel:hover{background:rgba(255,255,255,.08);color:#fff}
        @media(min-width:640px){
          .org-member-grid{grid-template-columns:repeat(2,1fr)}
          .org-modal-overlay{align-items:center;padding:16px}
          .org-modal{border-radius:20px;max-height:85vh}
          .org-modal-header{padding:20px 24px}
          .org-modal-body{padding:24px}
        }
        @media(max-width:767px){
          .admin-header-row{flex-direction:column}
          .admin-btn-add{width:100%;justify-content:center}
          .org-summary{grid-template-columns:repeat(2,1fr);gap:8px}
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
          .admin-btn-add{padding:12px 20px;font-size:14px}
        }
        @media(max-width:380px){
          .org-summary{gap:6px}
          .org-summary-card{padding:8px}
          .org-summary-count{font-size:18px}
          .org-summary-label{font-size:9px}
          .org-group-title{font-size:14px}
          .org-member-name{font-size:13px}
          .org-modal-body{padding:14px 16px}
        }
      `}</style>
    </>
  )
}
