"use client"

import { useState } from "react"

interface Question {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  category: string
  difficulty: string
}

interface Answer {
  questionId: string
  answer: string
}

interface QuizResult {
  score: number
  correct: number
  total: number
  results: {
    questionId: string
    answer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string | null
  }[]
}

export default function QuizPage() {
  const [step, setStep] = useState<"start" | "quiz" | "result">("start")
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [category, setCategory] = useState("P3K")
  const [count, setCount] = useState(10)

  const startQuiz = async () => {
    setLoading(true)
    setError("")
    try {
      const r = await fetch(`/api/quiz?count=${count}&category=${category}`)
      const d = await r.json()
      if (d.questions?.length === 0) {
        setError("Belum ada soal tersedia. Coba lagi nanti.")
        setLoading(false)
        return
      }
      setQuestions(d.questions)
      setAnswers([])
      setCurrent(0)
      setStep("quiz")
    } catch {
      setError("Gagal memuat soal. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId)
      return [...filtered, { questionId, answer }]
    })
  }

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    }
  }

  const prev = () => {
    if (current > 0) {
      setCurrent(c => c - 1)
    }
  }

  const submit = async () => {
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const d = await r.json()
      if (r.ok) {
        setResult(d)
        setStep("result")
      } else {
        setError(d.error || "Gagal submit jawaban")
      }
    } catch {
      setError("Gagal submit jawaban")
    } finally {
      setLoading(false)
    }
  }

  const answeredCount = answers.length
  const currentQ = questions[current]
  const selectedAnswer = answers.find(a => a.questionId === currentQ?.id)?.answer

  const getDifficultyColor = (d: string) => {
    if (d === "mudah") return "#34D399"
    if (d === "sedang") return "#FBBF24"
    return "#EF4444"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: "20px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4, fontFamily: "'Sansita', Georgia, serif" }}>
            Quiz P3K
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
            Uji pengetahuan Pertolongan Pertama pada Kecelakaan
          </p>
        </div>

        {error && (
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#EF4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* START */}
        {step === "start" && (
          <div style={{ background: "rgba(20,20,22,.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Mulai Quiz</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "inherit" }}
              >
                <option value="P3K">P3K</option>
                <option value="CPR">CPR</option>
                <option value="Bencana Alam">Bencana Alam</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>Jumlah Soal</label>
              <select
                value={count}
                onChange={e => setCount(parseInt(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "inherit" }}
              >
                <option value={5}>5 Soal</option>
                <option value={10}>10 Soal</option>
                <option value={15}>15 Soal</option>
                <option value={20}>20 Soal</option>
              </select>
            </div>

            <button
              onClick={startQuiz}
              disabled={loading}
              style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#E87A1A,#F97316)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Memuat Soal..." : "Mulai Quiz"}
            </button>
          </div>
        )}

        {/* QUIZ */}
        {step === "quiz" && currentQ && (
          <div>
            {/* Progress */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
                Soal {current + 1} dari {questions.length}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
                {answeredCount}/{questions.length} terjawab
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: "rgba(255,255,255,.1)", borderRadius: 4, marginBottom: 20 }}>
              <div style={{ height: "100%", width: `${((current + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg,#E87A1A,#F97316)", borderRadius: 4, transition: "width .3s" }} />
            </div>

            {/* Question card */}
            <div style={{ background: "rgba(20,20,22,.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{currentQ.category}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${getDifficultyColor(currentQ.difficulty)}20`, color: getDifficultyColor(currentQ.difficulty), fontWeight: 600 }}>{currentQ.difficulty}</span>
              </div>

              <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.6, marginBottom: 20, fontWeight: 600 }}>
                {currentQ.question}
              </p>

              {/* Options */}
              {(["A", "B", "C", "D"] as const).map(opt => {
                const optionKey = `option${opt}` as keyof Question
                const isSelected = selectedAnswer === opt
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(currentQ.id, opt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "14px 16px",
                      marginBottom: 10,
                      borderRadius: 12,
                      border: `1px solid ${isSelected ? "rgba(232,122,26,.5)" : "rgba(255,255,255,.1)"}`,
                      background: isSelected ? "rgba(232,122,26,.1)" : "rgba(255,255,255,.03)",
                      color: "#fff",
                      fontSize: 13,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .2s",
                    }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? "#F97316" : "rgba(255,255,255,.06)",
                      color: isSelected ? "#fff" : "rgba(255,255,255,.4)",
                      fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {opt}
                    </span>
                    <span>{currentQ[optionKey]}</span>
                  </button>
                )
              })}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={prev}
                disabled={current === 0}
                style={{ flex: 1, padding: 14, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 600, cursor: current === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: current === 0 ? 0.4 : 1 }}
              >
                Sebelumnya
              </button>

              {current === questions.length - 1 ? (
                <button
                  onClick={submit}
                  disabled={loading || answeredCount < questions.length}
                  style={{ flex: 1, padding: 14, background: "linear-gradient(135deg,#34D399,#10B981)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || answeredCount < questions.length ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading || answeredCount < questions.length ? 0.6 : 1 }}
                >
                  {loading ? "Memproses..." : "Selesai"}
                </button>
              ) : (
                <button
                  onClick={next}
                  style={{ flex: 1, padding: 14, background: "linear-gradient(135deg,#E87A1A,#F97316)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Selanjutnya
                </button>
              )}
            </div>

            {/* Question dots */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: "center" }}>
              {questions.map((q, i) => {
                const ans = answers.find(a => a.questionId === q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: "none",
                      background: i === current
                        ? "#F97316"
                        : ans
                          ? "rgba(52,211,153,.3)"
                          : "rgba(255,255,255,.06)",
                      color: i === current ? "#fff" : "rgba(255,255,255,.4)",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === "result" && result && (
          <div>
            <div style={{ background: "rgba(20,20,22,.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: 24, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>
                {result.score >= 80 ? "🏆" : result.score >= 60 ? "👏" : "💪"}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4, fontFamily: "'Sansita', Georgia, serif" }}>
                {result.score >= 80 ? "Luar Biasa!" : result.score >= 60 ? "Bagus Sekali!" : "Terus Belajar!"}
              </h2>
              <div style={{ fontSize: 48, fontWeight: 800, color: result.score >= 80 ? "#34D399" : result.score >= 60 ? "#FBBF24" : "#EF4444", marginBottom: 8 }}>
                {result.score}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>
                {result.correct} dari {result.total} benar
              </p>
            </div>

            {/* Detail jawaban */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Detail Jawaban</h3>
              {result.results.map((r, i) => {
                const q = questions.find(qq => qq.id === r.questionId)
                if (!q) return null
                return (
                  <div key={r.questionId} style={{ background: "rgba(20,20,22,.8)", borderRadius: 12, border: `1px solid ${r.isCorrect ? "rgba(52,211,153,.3)" : "rgba(239,68,68,.3)"}`, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{r.isCorrect ? "✅" : "❌"}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1 }}>Soal {i + 1}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 8, lineHeight: 1.5 }}>{q.question}</p>
                    {!r.isCorrect && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>
                        Jawaban Anda: <span style={{ color: "#EF4444", fontWeight: 600 }}>{r.answer}</span>
                        &nbsp;|&nbsp;Benar: <span style={{ color: "#34D399", fontWeight: 600 }}>{r.correctAnswer}</span>
                      </div>
                    )}
                    {r.explanation && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 6, padding: 10, background: "rgba(255,255,255,.03)", borderRadius: 8, lineHeight: 1.5 }}>
                        {r.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => { setStep("start"); setResult(null); setQuestions([]); setAnswers([]) }}
              style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#E87A1A,#F97316)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
