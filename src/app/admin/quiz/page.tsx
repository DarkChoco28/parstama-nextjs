"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface QuizQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string | null
  category: string
  difficulty: string
  isActive: boolean
  createdAt: string
}

export default function AdminQuiz() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    question: "", optionA: "", optionB: "", optionC: "", optionD: "",
    correctAnswer: "A", explanation: "", category: "P3K", difficulty: "sedang",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" })
      if (categoryFilter) params.append("category", categoryFilter)
      if (difficultyFilter) params.append("difficulty", difficultyFilter)
      const r = await fetch(`/api/admin/quiz?${params}`)
      const d = await r.json()
      setQuestions(d.questions || [])
      setTotalPages(d.pagination?.totalPages || 1)
      setTotalResults(d.pagination?.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, categoryFilter, difficultyFilter])

  useEffect(() => {
    if (status === "authenticated") {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" })
      if (categoryFilter) params.append("category", categoryFilter)
      if (difficultyFilter) params.append("difficulty", difficultyFilter)
      fetch(`/api/admin/quiz?${params}`)
        .then(r => r.json())
        .then(d => {
          setQuestions(d.questions || [])
          setTotalPages(d.pagination?.totalPages || 1)
          setTotalResults(d.pagination?.total || 0)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, page, categoryFilter, difficultyFilter])

  const resetForm = () => {
    setForm({
      question: "", optionA: "", optionB: "", optionC: "", optionD: "",
      correctAnswer: "A", explanation: "", category: "P3K", difficulty: "sedang",
    })
    setEditId(null)
    setShowForm(false)
  }

  const editQuestion = (q: QuizQuestion) => {
    setForm({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      category: q.category,
      difficulty: q.difficulty,
    })
    setEditId(q.id)
    setShowForm(true)
  }

  const saveQuestion = async () => {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      alert("Semua field soal wajib diisi")
      return
    }
    setSaving(true)
    try {
      const url = editId ? `/api/admin/quiz/${editId}` : "/api/admin/quiz"
      const method = editId ? "PUT" : "POST"
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (r.ok) {
        resetForm()
        fetchQuestions()
      } else {
        const d = await r.json()
        alert(d.error || "Gagal menyimpan soal")
      }
    } catch {
      alert("Gagal menyimpan soal")
    } finally {
      setSaving(false)
    }
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm("Yakin hapus soal ini?")) return
    try {
      const r = await fetch(`/api/admin/quiz/${id}`, { method: "DELETE" })
      if (r.ok) fetchQuestions()
    } catch (e) {
      console.error(e)
    }
  }

  const toggleActive = async (q: QuizQuestion) => {
    try {
      const r = await fetch(`/api/admin/quiz/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !q.isActive }),
      })
      if (r.ok) fetchQuestions()
    } catch (e) {
      console.error(e)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>Memuat data soal...</span>
      </div>
    )
  }
  if (!session) return null

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="admin-title">Quiz P3K</h1>
            <p className="admin-subtitle">Kelola bank soal quiz</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="admin-btn-primary"
          >
            {showForm ? "Tutup" : "+ Tambah Soal"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="admin-card" style={{ padding: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{editId ? "Edit Soal" : "Tambah Soal Baru"}</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Pertanyaan *</label>
              <textarea
                value={form.question}
                onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                className="admin-input"
                rows={2}
                style={{ resize: "vertical" }}
                placeholder="Tulis pertanyaan di sini..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {(["A", "B", "C", "D"] as const).map(opt => (
                <div key={opt}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>
                    Opsi {opt}
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctAnswer === opt}
                      onChange={() => setForm(p => ({ ...p, correctAnswer: opt }))}
                      style={{ accentColor: "#34D399" }}
                    />
                    {form.correctAnswer === opt && <span style={{ color: "#34D399", fontSize: 10 }}>BENAR</span>}
                  </label>
                  <input
                    value={form[`option${opt}` as keyof typeof form] as string}
                    onChange={e => setForm(p => ({ ...p, [`option${opt}`]: e.target.value }))}
                    className="admin-input"
                    placeholder={`Opsi ${opt}`}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Kategori</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="admin-input">
                  <option value="P3K">P3K</option>
                  <option value="CPR">CPR</option>
                  <option value="Bencana Alam">Bencana Alam</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Kesulitan</label>
                <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="admin-input">
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Jawaban Benar</label>
                <select value={form.correctAnswer} onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))} className="admin-input">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Penjelasan (opsional)</label>
              <textarea
                value={form.explanation}
                onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
                className="admin-input"
                rows={2}
                style={{ resize: "vertical" }}
                placeholder="Penjelasan jawaban..."
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveQuestion} disabled={saving} className="admin-btn-primary" style={{ flex: 1 }}>
                {saving ? "Menyimpan..." : editId ? "Update Soal" : "Simpan Soal"}
              </button>
              <button onClick={resetForm} style={{ padding: "10px 18px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="admin-select">
            <option value="">Semua Kategori</option>
            <option value="P3K">P3K</option>
            <option value="CPR">CPR</option>
            <option value="Bencana Alam">Bencana Alam</option>
            <option value="Umum">Umum</option>
          </select>
          <select value={difficultyFilter} onChange={e => { setDifficultyFilter(e.target.value); setPage(1) }} className="admin-select">
            <option value="">Semua Kesulitan</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", alignSelf: "center" }}>
            {totalResults} soal
          </span>
        </div>

        {/* Questions list */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {questions.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 13 }}>
              Belum ada soal. Klik &quot;Tambah Soal&quot; untuk membuat soal baru.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(232,122,26,.6)", background: "rgba(232,122,26,.1)", border: "1px solid rgba(232,122,26,.2)", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>
                    {idx + 1 + (page - 1) * 20}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{q.question}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)" }}>{q.category}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: q.difficulty === "mudah" ? "rgba(52,211,153,.1)" : q.difficulty === "sedang" ? "rgba(251,191,36,.1)" : "rgba(239,68,68,.1)", color: q.difficulty === "mudah" ? "#34D399" : q.difficulty === "sedang" ? "#FBBF24" : "#EF4444" }}>{q.difficulty}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: q.isActive ? "rgba(52,211,153,.1)" : "rgba(239,68,68,.1)", color: q.isActive ? "#34D399" : "#EF4444" }}>{q.isActive ? "Aktif" : "Nonaktif"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                      <span>A: {q.optionA}</span>
                      <span>B: {q.optionB}</span>
                      <span>C: {q.optionC}</span>
                      <span>D: {q.optionD}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#34D399", marginTop: 4, fontWeight: 600 }}>
                      Jawaban: {q.correctAnswer}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleActive(q)} className={q.isActive ? "admin-btn-danger-sm" : "admin-btn-success-sm"} style={{ fontSize: 10 }}>
                      {q.isActive ? "Nonaktif" : "Aktif"}
                    </button>
                    <button onClick={() => editQuestion(q)} className="admin-btn-blue-sm">Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} className="admin-btn-danger-sm">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                Halaman {page} dari {totalPages}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="admin-page-btn">Sebelumnya</button>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="admin-page-btn">Selanjutnya</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
