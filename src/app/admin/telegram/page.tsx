"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminTelegram() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [botToken, setBotToken] = useState("")
  const [chatId, setChatId] = useState("")
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/settings/telegram")
        .then(r => r.json())
        .then(d => {
          setBotToken(d.botToken || "")
          setChatId(d.chatId || "")
          setConfigured(!!(d.botToken && d.chatId))
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status])

  const save = async () => {
    if (!botToken || !chatId) {
      setResult({ type: "error", text: "Bot Token dan Chat ID wajib diisi" })
      return
    }
    setSaving(true)
    setResult(null)
    try {
      const r = await fetch("/api/admin/settings/telegram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, chatId }),
      })
      const d = await r.json()
      if (r.ok) {
        setResult({ type: "success", text: "Setting berhasil disimpan!" })
        setConfigured(true)
      } else {
        setResult({ type: "error", text: d.error || "Gagal menyimpan" })
      }
    } catch {
      setResult({ type: "error", text: "Gagal menyimpan setting" })
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    const msg = testMessage.trim() || "Halo! Ini pesan test dari PARSTAMA."
    setTesting(true)
    setResult(null)
    try {
      const r = await fetch("/api/admin/notifications/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      })
      const d = await r.json()
      if (r.ok) {
        setResult({ type: "success", text: "Pesan test berhasil dikirim ke Telegram!" })
      } else {
        setResult({ type: "error", text: d.error || "Gagal mengirim pesan" })
      }
    } catch {
      setResult({ type: "error", text: "Gagal mengirim pesan test" })
    } finally {
      setTesting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <span>Memuat...</span>
      </div>
    )
  }
  if (!session) return null

  return (
    <div className="admin-page">
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Telegram Bot</h1>
          <p className="admin-subtitle">Konfigurasi notifikasi otomatis ke grup Telegram</p>
        </div>

        {result && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
            border: `1px solid ${result.type === "success" ? "rgba(52,211,153,.3)" : "rgba(239,68,68,.3)"}`,
            background: result.type === "success" ? "rgba(52,211,153,.1)" : "rgba(239,68,68,.1)",
            color: result.type === "success" ? "#34D399" : "#EF4444",
          }}>
            {result.text}
          </div>
        )}

        <div className="admin-card" style={{ padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Konfigurasi Bot</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>
              Bot Token
            </label>
            <input
              type="text"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="admin-input"
              style={{ fontFamily: "monospace" }}
            />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
              Dapat dari @BotFather di Telegram
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontWeight: 600 }}>
              Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              placeholder="-1001234567890"
              className="admin-input"
              style={{ fontFamily: "monospace" }}
            />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
              ID grup atau channel Telegram. Kirim pesan ke bot lalu cek{" "}
              <a href="https://api.telegram.org/bot TOKEN/getUpdates" target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA" }}>
                getUpdates
              </a>{" "}
              untuk dapat chat ID.
            </div>
          </div>

          <button onClick={save} disabled={saving} className="admin-btn-primary" style={{ width: "100%" }}>
            {saving ? "Menyimpan..." : "Simpan Setting"}
          </button>
        </div>

        <div className="admin-card" style={{ padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Cara Mendapatkan Bot Token & Chat ID</h2>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.8 }}>
            <p><strong style={{ color: "#F97316" }}>1. Buat Bot:</strong> Buka Telegram, cari @BotFather, kirim /newbot, ikuti instruksi.</p>
            <p><strong style={{ color: "#F97316" }}>2. Dapatkan Token:</strong> BotFather akan memberikan token seperti <code style={{ background: "rgba(255,255,255,.1)", padding: "2px 6px", borderRadius: 4 }}>123456789:ABCdef...</code></p>
            <p><strong style={{ color: "#F97316" }}>3. Tambah ke Grup:</strong> Tambah bot ke grup Telegram admin, lalu beri permission admin.</p>
            <p><strong style={{ color: "#F97316" }}>4. Dapatkan Chat ID:</strong> Buka <code style={{ background: "rgba(255,255,255,.1)", padding: "2px 6px", borderRadius: 4 }}>https://api.telegram.org/botTOKEN/getUpdates</code> di browser, cari <code style={{ background: "rgba(255,255,255,.1)", padding: "2px 6px", borderRadius: 4 }}>{'"chat":{"id":xxxxx}'}</code></p>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Test Kirim Pesan</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>
            Kirim pesan test ke grup Telegram untuk memverifikasi konfigurasi.
          </p>

          <div style={{ marginBottom: 12 }}>
            <textarea
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              placeholder="Pesan test (opsional, kosongkan untuk pesan default)"
              className="admin-input"
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            onClick={sendTest}
            disabled={testing || !configured}
            className="admin-btn-primary"
            style={{ width: "100%" }}
          >
            {testing ? "Mengirim..." : "Kirim Pesan Test"}
          </button>

          {!configured && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 8, textAlign: "center" }}>
              Simpan setting terlebih dahulu sebelum mengirim test
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
