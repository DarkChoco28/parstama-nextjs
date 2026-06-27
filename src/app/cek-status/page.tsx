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
  { label: "📋 Cara daftar", message: "Bagaimana cara mendaftar PMR PARSTAMA?" },
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
      content: "Halo! 👋 Selamat datang di AI Assistant PMR PARSTAMA.\n\nAku bisa membantu kamu dengan:\n• 📋 Pertanyaan seputar pendaftaran\n• 🏥 Informasi medis & pertolongan pertama\n• ❓ Tanya apa aja tentang PMR\n\nSilakan ketik pertanyaanmu di bawah!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Maaf, terjadi kesalahan. Coba lagi ya!",
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
          radial-gradient(circle at top left, rgba(220,38,38,0.1), transparent 30%),
          radial-gradient(circle at bottom right, rgba(220,38,38,0.08), transparent 35%)
        `,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/parstama_logo.png" alt="PARSTAMA" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,.4))" }} />
            <img src="/smkn_logo.png" alt="SMKN" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,.4))" }} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight" style={{ fontFamily: "Sansita, Georgia, serif" }}>
              AI Assistant
            </h1>
            <p className="text-zinc-500 text-xs truncate">PMR PARSTAMA</p>
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
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
                      ? "bg-gradient-to-br from-red-600 to-red-800 text-white rounded-br-md"
                      : "bg-white/[0.05] border border-white/[0.08] text-zinc-200 rounded-bl-md"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                      <path d="M6 10h12l1 10H5L6 10z" />
                    </svg>
                  </div>
                  <span className="text-zinc-500 text-[11px] font-medium">AI Assistant</span>
                </div>
                <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                    className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-medium hover:border-red-500/40 hover:text-red-300 hover:bg-red-500/[0.06] transition-all cursor-pointer min-h-[36px]"
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
      <div className="sticky bottom-0 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-2 focus-within:border-red-500/30 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaanmu..."
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
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white hover:from-red-400 hover:to-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-zinc-600 text-[10px] text-center mt-2">
            AI Assistant PMR PARSTAMA — Untuk informasi medis darurat, selalu hubungi 119 🚑
          </p>
        </div>
      </div>
    </div>
  )
}