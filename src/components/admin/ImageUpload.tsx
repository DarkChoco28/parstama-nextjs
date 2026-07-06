"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  className?: string
  size?: number
}

export default function ImageUpload({ value, onChange, folder = "general", label = "Gambar", className = "", size = 80 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) { alert("Maksimal 5MB"); return }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", folder)
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const d = await r.json()
      if (r.ok) onChange(d.url)
      else alert(d.error || "Gagal upload")
    } catch { alert("Gagal upload") }
    finally { setUploading(false) }
  }

  return (
    <div className={`image-upload-wrap ${className}`}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files?.[0]
        if (f) handleUpload(f)
        e.target.value = ""
      }} />

      {value ? (
        <div style={{ position: "relative", width: size, height: size, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)" }}>
          <Image src={value} alt={label} fill style={{ objectFit: "cover" }} unoptimized />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer",
              opacity: 0, transition: "opacity 0.2s",
            }}
            className="image-upload-overlay"
          >
            {uploading ? "..." : "Ganti"}
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
              background: "#EF4444", color: "#fff", fontSize: 12, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", border: "none", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            width: size, height: size, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.03)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer",
            color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500, transition: "all 0.2s",
          }}
        >
          {uploading ? (
            <div className="admin-loading-spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          )}
          {uploading ? "Upload..." : "Upload"}
        </button>
      )}

      <style>{`
        .image-upload-wrap { display: inline-flex; flex-direction: column; gap: 6px; }
        .image-upload-overlay:hover { opacity: 1 !important; }
        .image-upload-wrap button:not(:disabled):hover { border-color: rgba(232,122,26,0.4); }
      `}</style>
    </div>
  )
}
