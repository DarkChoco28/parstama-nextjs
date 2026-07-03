export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0B" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
        <p className="text-zinc-500 text-sm" style={{ fontFamily: "var(--font-sansita), Georgia, serif" }}>Memuat...</p>
      </div>
    </div>
  )
}
