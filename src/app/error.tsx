/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0A0A0B" }}
    >
      <div className="text-center max-w-md">
        <div
          className="text-[100px] sm:text-[140px] font-bold leading-none mb-4"
          style={{
            fontFamily: "Sansita, Georgia, serif",
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          !
        </div>
        <h1
          className="text-white text-xl sm:text-2xl font-bold mb-2"
          style={{ fontFamily: "Sansita, Georgia, serif" }}
        >
          Terjadi Kesalahan
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mb-8 leading-relaxed">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all cursor-pointer"
          style={{ background: "linear-gradient(135deg, #E87A1A, #F97316)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
