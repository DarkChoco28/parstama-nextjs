import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0A0A0B" }}
    >
      <div className="text-center max-w-md">
        <div className="text-[120px] sm:text-[180px] font-bold leading-none mb-4" style={{ fontFamily: "Sansita, Georgia, serif", background: "linear-gradient(135deg, #E87A1A, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          404
        </div>
        <h1 className="text-white text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "Sansita, Georgia, serif" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mb-8 leading-relaxed">
          Maaf, halaman yang kamu cari gak ada atau udah dipindah. Yuk balik ke beranda!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #E87A1A, #F97316)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
