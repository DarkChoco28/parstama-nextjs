"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/admin/ImageUpload"

interface Article {
  id: string; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; author: string; category: string; isPublished: boolean; viewCount: number; createdAt: string; updatedAt: string
}

const defaultForm = { title: "", excerpt: "", content: "", coverImage: "", author: "Admin PARSTAMA", category: "Kesehatan", isPublished: false }

export default function AdminArticles() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" })
      if (searchQuery.trim()) params.append("search", searchQuery.trim())
      if (categoryFilter) params.append("category", categoryFilter)
      if (statusFilter) params.append("status", statusFilter)
      const r = await fetch(`/api/admin/articles?${params}`)
      const d = await r.json()
      setArticles(d.articles || [])
      setTotalPages(d.pagination?.totalPages || 1)
      setTotalResults(d.pagination?.total || 0)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [page, searchQuery, categoryFilter, statusFilter])

  useEffect(() => { if (status === "authenticated") fetchArticles() }, [status, fetchArticles])

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowForm(true) }
  const openEdit = (a: Article) => { setEditing(a); setForm({ title: a.title, excerpt: a.excerpt || "", content: a.content, coverImage: a.coverImage || "", author: a.author, category: a.category, isPublished: a.isPublished }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(defaultForm) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return alert("Judul dan konten wajib diisi")
    setSaving(true)
    try {
      const url = editing ? `/api/admin/articles/${editing.id}` : "/api/admin/articles"
      const method = editing ? "PUT" : "POST"
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (r.ok) { closeForm(); fetchArticles() } else { const d = await r.json(); alert(d.error || "Gagal menyimpan") }
    } catch (e) { console.error(e); alert("Terjadi kesalahan") } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try { const r = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" }); if (r.ok) { setDeleteConfirm(null); fetchArticles() } } catch (e) { console.error(e) }
  }

  const togglePublish = async (a: Article) => {
    try { await fetch(`/api/admin/articles/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !a.isPublished }) }); fetchArticles() } catch (e) { console.error(e) }
  }

  if (status === "loading" || (loading && articles.length === 0)) {
    return <div className="admin-loading"><div className="admin-loading-spinner" /><span>Memuat artikel...</span></div>
  }

  return (
      <main className="admin-main">
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="admin-title">Blog & Artikel</h2>
            <p className="admin-subtitle">{totalResults} artikel</p>
          </div>
          <button onClick={openAdd} className="admin-btn-primary">+ Artikel Baru</button>
        </div>

        {/* Filters */}
        <div className="admin-card" style={{ padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchArticles() } }} placeholder="Cari judul..." aria-label="Cari judul artikel" className="admin-input" style={{ flex: 1, minWidth: 150 }} />
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="admin-select" aria-label="Filter kategori artikel">
              <option value="">Semua Kategori</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="P3K">P3K</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="admin-select" aria-label="Filter status artikel">
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Articles list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {articles.length === 0 && <div className="admin-card" style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)" }}>Tidak ada artikel</div>}
          {articles.map(a => (
            <div key={a.id} className="admin-card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{a.title}</h3>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: a.isPublished ? "rgba(52,211,153,.12)" : "rgba(252,211,77,.12)", color: a.isPublished ? "#34D399" : "#FCD34D", border: `1px solid ${a.isPublished ? "rgba(52,211,153,.3)" : "rgba(252,211,77,.3)"}`, fontWeight: 600 }}>{a.isPublished ? "Published" : "Draft"}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "rgba(232,122,26,.1)", color: "#F97316", border: "1px solid rgba(232,122,26,.2)", fontWeight: 600 }}>{a.category}</span>
                  </div>
                  {a.excerpt && <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.excerpt}</p>}
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                    <span>{a.author}</span>
                    <span>{a.viewCount} views</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                  <button onClick={() => togglePublish(a)} className={a.isPublished ? "admin-btn-email-sm" : "admin-btn-success-sm"}>{a.isPublished ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => openEdit(a)} className="admin-btn-blue-sm">Edit</button>
                  {deleteConfirm === a.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleDelete(a.id)} className="admin-btn-danger-sm">Ya</button>
                      <button onClick={() => setDeleteConfirm(null)} className="admin-btn-blue-sm">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(a.id)} className="admin-btn-danger-sm">Hapus</button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
          <div className="reg-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="reg-modal-header">
              <h2 className="reg-modal-title">{editing ? "Edit Artikel" : "Artikel Baru"}</h2>
              <button onClick={closeForm} className="reg-modal-close" aria-label="Tutup">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="reg-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Judul *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="Judul artikel" aria-label="Judul" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Excerpt</label>
                <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="admin-input" placeholder="Ringkasan singkat" aria-label="Excerpt" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Konten *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="admin-input" rows={10} placeholder="Tulis konten artikel di sini..." aria-label="Konten" style={{ resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Penulis</label>
                  <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="admin-input" aria-label="Penulis" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="admin-select" aria-label="Kategori" style={{ width: "100%", padding: "10px 12px" }}>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="P3K">P3K</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4, display: "block" }}>Cover Image</label>
                <ImageUpload value={form.coverImage} onChange={url => setForm({ ...form, coverImage: url })} folder="articles" label="Cover" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="admin-checkbox" aria-label="Publish sekarang" />
                <label style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Publish sekarang</label>
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
