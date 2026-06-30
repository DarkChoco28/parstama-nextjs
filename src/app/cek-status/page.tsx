"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickQuestions = [
  { label: "📋 Cara daftar", message: "Bagaimana cara mendaftar PARSTAMA?" },
  { label: "🏥 PPGD", message: "Apa itu PPGD?" },
  { label: "💉 Pertolongan luka", message: "Bagaimana cara menangani luka berdarah?" },
  { label: "💰 Biaya", message: "Berapa biaya pendaftaran?" },
  { label: "📱 Kontak", message: "Bagaimana cara menghubungi panitia?" },
  { label: "🦴 Patah tulang", message: "Bagaimana penanganan patah tulang?" },
]

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! 👋 Selamat datang di AI Assistant PARSTAMA.\n\nAku bisa membantu kamu dengan:\n• 📋 Pertanyaan seputar pendaftaran\n• 🏥 Informasi medis & pertolongan pertama\n• 📷 **Kirim foto luka/cedera** untuk panduan P3K\n• ❓ Tanya apa aja tentang PARSTAMA\n\nSilakan ketik pertanyaanmu di bawah!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setSelectedImage(base64)
      setImagePreview(URL.createObjectURL(file))
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    const hasImage = !!selectedImage
    if ((!msg && !hasImage) || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg || (hasImage ? "📷 Gambar" : ""),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      let data: any
      if (hasImage) {
        const res = await fetch("/api/chat/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: selectedImage, message: msg || undefined }),
        })
        data = await res.json()
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg,
            history: messages.filter(m => m.id !== "welcome").map(m => ({ role: m.role, content: m.content })),
          }),
        })
        data = await res.json()
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "Maaf, terjadi kesalahan. Coba lagi ya!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Gagal mengirim pesan. Coba lagi ya! 🔄",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      setSelectedImage(null)
      setImagePreview(null)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col"
      style={{
        backgroundImage: `
          radial-gradient(circle at top left, rgba(232,122,26,0.1), transparent 30%),
          radial-gradient(circle at bottom right, rgba(232,122,26,0.08), transparent 35%)
        `,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(232,122,26,.4))" }} />
            <img src="/smkn_logo.png" alt="SMKN" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(232,122,26,.4))" }} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight" style={{ fontFamily: "Sansita, Georgia, serif" }}>
              AI Assistant
            </h1>
            <p className="text-zinc-500 text-xs truncate">PARSTAMA</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-medium hidden sm:block">Online</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                        <path d="M6 10h12l1 10H5L6 10z" />
                      </svg>
                    </div>
                    <span className="text-zinc-500 text-[11px] font-medium">AI Assistant</span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-linear-to-br from-orange-600 to-orange-800 text-white rounded-br-md"
                      : "bg-white/5 border border-white/8 text-zinc-200 rounded-bl-md"
                  }`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                />

                <div className={`text-[10px] text-zinc-600 mt-1 ${msg.role === "user" ? "text-right mr-1" : "ml-1"}`}>
                  {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%]">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                      <path d="M6 10h12l1 10H5L6 10z" />
                    </svg>
                  </div>
                  <span className="text-zinc-500 text-[11px] font-medium">AI Assistant</span>
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions (only show at start) */}
          {messages.length <= 1 && (
            <div className="pt-2">
              <p className="text-zinc-500 text-xs mb-3 ml-1 font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.message)}
                    className="px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-zinc-300 text-xs font-medium hover:border-orange-500/40 hover:text-orange-300 hover:bg-orange-500/6 transition-all cursor-pointer min-h-[36px]"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/6 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {imagePreview && (
            <div style={{ marginBottom: 8, display: "inline-flex", position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src={imagePreview} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover" }} />
              <button
                onClick={removeImage}
                style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-white/4 border border-white/8 rounded-2xl px-3 py-2 focus-within:border-orange-500/30 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Kirim gambar"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-orange-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Tambahkan pertanyaan (opsional)..." : "Ketik pertanyaanmu..."}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-zinc-500 resize-none outline-none min-h-[36px] max-h-[120px] py-1.5"
              style={{
                height: "auto",
                overflow: input.split("\n").length > 4 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = Math.min(target.scrollHeight, 120) + "px"
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white hover:from-orange-400 hover:to-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-zinc-600 text-[10px] text-center mt-2">
            AI Assistant PARSTAMA — Kirim foto luka/cedera untuk panduan P3K 🚑
          </p>
        </div>
      </div>
    </div>
  )
}