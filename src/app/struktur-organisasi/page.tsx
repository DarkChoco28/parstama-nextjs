"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

interface OrganizationMember {
  id: string
  name: string
  nickname: string | null
  position: string
  bio: string | null
  photo: string | null
  level: number
  parentId: string | null
  sortOrder: number
  period: string | null
  isVisible: boolean
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return "from-orange-600 to-orange-800"
    case 1:
      return "from-orange-500 to-orange-700"
    case 2:
      return "from-orange-400 to-orange-600"
    default:
      return "from-zinc-600 to-zinc-800"
  }
}

function getLevelLabel(level: number): string {
  switch (level) {
    case 0:
      return "Pengurus Inti"
    case 1:
      return "Kepala Divisi"
    case 2:
      return "Staff"
    default:
      return "Anggota"
  }
}

function AnimatedSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
      }}
    >
      {children}
    </div>
  )
}

function HoverCard({ member, children }: { member: OrganizationMember; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-3 rounded-xl bg-zinc-900 border border-white/10 shadow-xl" style={{ backdropFilter: "blur(16px)" }}>
          <p className="text-white font-bold text-xs">{member.name}</p>
          {member.nickname && <p className="text-zinc-400 text-[10px]">({member.nickname})</p>}
          <p className="text-orange-400 text-[10px] font-medium mt-0.5">{member.position}</p>
          {member.bio && <p className="text-zinc-500 text-[10px] mt-1.5 leading-relaxed">{member.bio}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default function StrukturOrganisasiPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data")
        return res.json()
      })
      .then((data) => {
        setMembers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const level0 = useMemo(() => members.filter((m) => m.level === 0), [members])
  const level1 = useMemo(() => members.filter((m) => m.level === 1), [members])
  const level2 = useMemo(() => members.filter((m) => m.level === 2), [members])
  const level3 = useMemo(() => members.filter((m) => m.level === 3), [members])

  const period = useMemo(() => {
    const periods = members.map((m) => m.period).filter(Boolean)
    return periods.length > 0 ? periods[0] : "2026/2027"
  }, [members])

  const renderMemberNode = (member: OrganizationMember, isTop = false) => {
    const initials = getInitials(member.name)
    const colorClass = getLevelColor(member.level)
    const size = isTop ? "w-20 h-20" : "w-16 h-16"

    return (
      <HoverCard member={member}>
        <div className="flex flex-col items-center gap-1.5 relative group">
          <div
            className={`${size} rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/30 group-hover:shadow-xl relative z-10`}
            style={{ filter: "drop-shadow(0 0 8px rgba(232,122,26,0.3))" }}
          >
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={80}
                height={80}
                className="w-full h-full rounded-full object-cover"
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="text-center">
            <p className="text-white text-xs font-semibold leading-tight">
              {member.nickname || member.name.split(" ")[0]}
            </p>
            <p className="text-zinc-500 text-[10px] leading-tight">{member.position}</p>
          </div>
        </div>
      </HoverCard>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes crossFloat1 {
          0%,100% { transform: perspective(800px) rotateY(0deg) rotateX(10deg) translateZ(0px) translateY(0px); }
          50% { transform: perspective(800px) rotateY(180deg) rotateX(-10deg) translateZ(40px) translateY(-30px); }
        }
        @keyframes crossFloat2 {
          0%,100% { transform: perspective(800px) rotateY(180deg) rotateX(-15deg) translateZ(0px) translateY(0px); }
          50% { transform: perspective(800px) rotateY(360deg) rotateX(15deg) translateZ(50px) translateY(-20px); }
        }
        @keyframes logo3D {
          0%,100% { transform: perspective(400px) rotateY(-12deg) rotateX(5deg) translateY(0px); }
          25% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); }
          50% { transform: perspective(400px) rotateY(12deg) rotateX(5deg) translateY(0px); }
          75% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseGlow {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .tree-line-v {
          position: absolute;
          width: 2px;
          background: linear-gradient(to bottom, rgba(232,122,26,0.4), rgba(232,122,26,0.1));
          left: 50%;
          transform: translateX(-50%);
        }
        .tree-line-h {
          position: absolute;
          height: 2px;
          background: linear-gradient(to right, rgba(232,122,26,0.1), rgba(232,122,26,0.4), rgba(232,122,26,0.1));
          top: 50%;
          transform: translateY(-50%);
        }
        .tree-node {
          position: relative;
        }
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glass-card:hover {
          border-color: rgba(232,122,26,0.3);
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      <div className="min-h-screen bg-[#0A0A0B] flex flex-col"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(232,122,26,0.1), transparent 30%),
            radial-gradient(circle at bottom right, rgba(232,122,26,0.08), transparent 35%)
          `,
        }}
      >
        {/* Floating 3D Red Cross symbols */}
        <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 40, height: 40, top: "20%", left: "10%", animation: "crossFloat1 12s ease-in-out infinite" }}>
          <svg viewBox="0 0 24 24" fill="#E87A1A" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
        </div>
        <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 28, height: 28, top: "60%", left: "85%", animation: "crossFloat2 14s ease-in-out infinite 2s" }}>
          <svg viewBox="0 0 24 24" fill="#E87A1A" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
        </div>
        <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 50, height: 50, top: "75%", left: "15%", animation: "crossFloat1 16s ease-in-out infinite 1s" }}>
          <svg viewBox="0 0 24 24" fill="#E87A1A" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
        </div>
        <div className="fixed pointer-events-none z-0 opacity-[0.06]" style={{ width: 22, height: 22, top: "15%", left: "80%", animation: "crossFloat2 10s ease-in-out infinite 0.5s" }}>
          <svg viewBox="0 0 24 24" fill="#E87A1A" width="100%" height="100%"><rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/></svg>
        </div>

        {/* Scan line */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-20"
          style={{
            background: "linear-gradient(transparent 50%, rgba(232,122,26,0.03) 50%)",
            backgroundSize: "100% 4px",
            animation: "scanline 8s linear infinite",
          }}
        />

        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/6">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 no-underline">
                <Image src="/smkn_logo.png" alt="SMKN" width={60} height={60} className="w-15 h-15 sm:w-16 sm:h-16 rounded-lg object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(232,122,26,.4))" }} />
                <Image src="/parstama_logo.png" alt="PARSTAMA" width={60} height={60} className="w-15 h-15 sm:w-16 sm:h-16 rounded-lg object-contain" style={{ animation: "logo3D 6s ease-in-out infinite", filter: "drop-shadow(0 0 6px rgba(232,122,26,.4))" }} />
              </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-sm sm:text-base leading-tight" style={{ fontFamily: "Sansita, Georgia, serif" }}>
                Struktur Organisasi
              </h1>
              <p className="text-zinc-500 text-xs truncate">PARSTAMA</p>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-zinc-400 text-xs font-medium hover:border-orange-500/30 hover:text-orange-400 transition-all no-underline"
            >
              Beranda
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 relative z-10 px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-10" style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
              <h1 className="text-[clamp(1.8rem,5vw,2.8rem)] font-extrabold mb-2 leading-tight">
                <span className="bg-linear-to-r from-orange-400 via-orange-400 to-orange-400 bg-size-[200%_auto] bg-clip-text text-transparent">
                  Struktur Organisasi
                </span>{" "}
                <span className="text-white">PARSTAMA</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base">
                Periode <strong className="text-zinc-200">{period}</strong>
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center animate-pulse">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M6 10h12l1 10H5L6 10z" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm">Memuat data organisasi...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E87A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg bg-white/4 border border-white/8 text-zinc-300 text-sm hover:border-orange-500/30 hover:text-orange-400 transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && members.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm">Belum ada data struktur organisasi</p>
              </div>
            )}

            {/* Tree Hierarchy */}
            {!loading && !error && members.length > 0 && (
              <AnimatedSection className="mb-16">
                <h2 className="text-center text-zinc-300 text-sm font-semibold mb-8 uppercase tracking-wider">
                  Hierarki Organisasi
                </h2>

                {/* Tree Container */}
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-150 flex flex-col items-center gap-6">
                    {/* Level 0: Ketua & Wakil */}
                    {level0.length > 0 && (
                      <div className="relative">
                        <div className="flex items-end justify-center gap-8 sm:gap-12">
                          {level0.map((member) => (
                            <div key={member.id} className="tree-node">
                              {renderMemberNode(member, true)}
                            </div>
                          ))}
                        </div>
                        {/* Vertical line down */}
                        {level1.length > 0 && (
                          <div className="tree-line-v" style={{ top: "100%", height: "30px" }} />
                        )}
                      </div>
                    )}

                    {/* Level 1: Division Heads */}
                    {level1.length > 0 && (
                      <div className="relative">
                        {/* Horizontal line across all level 1 */}
                        {level1.length > 1 && (
                          <div
                            className="tree-line-h"
                            style={{
                              left: `${100 / level1.length / 2}%`,
                              width: `${100 - 100 / level1.length}%`,
                              top: "0",
                            }}
                          />
                        )}
                        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                          {level1.map((member) => {
                            return (
                              <div key={member.id} className="tree-node flex flex-col items-center">
                                {/* Vertical line from horizontal */}
                                <div className="tree-line-v" style={{ top: "-16px", height: "16px" }} />
                                {renderMemberNode(member)}
                                {/* Vertical line to children */}
                                {level2.some((l2) => l2.parentId === member.id) && (
                                  <div className="tree-line-v" style={{ top: "100%", height: "20px" }} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Level 2: Staff grouped by parent */}
                    {level1.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 w-full">
                        {level1.map((head) => {
                          const children = level2.filter((l2) => l2.parentId === head.id)
                          if (children.length === 0) return null
                          return (
                            <div key={head.id} className="flex flex-col items-center">
                              <div className="flex flex-wrap justify-center gap-3">
                                {children.map((member) => (
                                  <div key={member.id} className="tree-node">
                                    {renderMemberNode(member)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    </div>
                  </div>
                </AnimatedSection>
              )}

            {/* Member Cards Section */}
            {!loading && !error && members.length > 0 && (
              <AnimatedSection delay={0.2}>
                {/* Level 0 & 1 cards */}
                <div className="mb-8">
                  <h2 className="text-center text-zinc-300 text-sm font-semibold mb-6 uppercase tracking-wider">
                    Pengurus Inti & Kepala Divisi
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...level0, ...level1].map((member) => (
                      <div
                        key={member.id}
                        className="glass-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                        style={{ borderLeft: "3px solid #E87A1A" }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full bg-linear-to-br ${getLevelColor(member.level)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}>
                            {member.photo ? (
                              <Image src={member.photo} alt={member.name} width={56} height={56} className="w-full h-full rounded-full object-cover" unoptimized />
                            ) : (
                              getInitials(member.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm leading-tight truncate">
                              {member.name}
                            </p>
                            {member.nickname && (
                              <p className="text-zinc-500 text-xs">({member.nickname})</p>
                            )}
                            <p className="text-orange-400 text-xs font-medium mt-0.5">
                              {member.position}
                            </p>
                            <p className="text-zinc-600 text-[10px] mt-0.5">
                              {getLevelLabel(member.level)}
                            </p>
                            {member.bio && (
                              <p className="text-zinc-500 text-[11px] mt-2 leading-relaxed line-clamp-3">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 2: Sekretaris & Bendahara */}
                {level2.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-center text-zinc-300 text-sm font-semibold mb-6 uppercase tracking-wider">
                      Pengurus Inti
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                      {level2.map((member) => (
                        <div
                          key={member.id}
                          className="glass-card rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                          style={{ borderLeft: "3px solid rgba(232,122,26,0.4)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                              {member.photo ? (
                              <Image src={member.photo} alt={member.name} width={56} height={56} className="w-full h-full rounded-full object-cover" unoptimized />
                              ) : (
                                getInitials(member.name)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-xs leading-tight truncate">
                                {member.name}
                              </p>
                              {member.nickname && (
                                <p className="text-zinc-500 text-[10px]">({member.nickname})</p>
                              )}
                              <p className="text-orange-400 text-[10px] font-medium mt-0.5 truncate">
                                {member.position}
                              </p>
                              {member.bio && (
                                <p className="text-zinc-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                                  {member.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level 3: Humas Internal & Humas Eksternal */}
                {level3.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-center text-zinc-300 text-sm font-semibold mb-6 uppercase tracking-wider">
                      Humas
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                      {level3.map((member) => (
                        <div
                          key={member.id}
                          className="glass-card rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                          style={{ borderLeft: "3px solid rgba(232,122,26,0.4)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                              {member.photo ? (
                              <Image src={member.photo} alt={member.name} width={56} height={56} className="w-full h-full rounded-full object-cover" unoptimized />
                              ) : (
                                getInitials(member.name)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-xs leading-tight truncate">
                                {member.name}
                              </p>
                              {member.nickname && (
                                <p className="text-zinc-500 text-[10px]">({member.nickname})</p>
                              )}
                              <p className="text-orange-400 text-[10px] font-medium mt-0.5 truncate">
                                {member.position}
                              </p>
                              {member.bio && (
                                <p className="text-zinc-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                                  {member.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AnimatedSection>
            )}

            {/* Footer info */}
            {!loading && !error && members.length > 0 && (
              <AnimatedSection delay={0.4}>
                <div className="text-center mt-12 pb-8">
                  <div className="glass-card inline-flex items-center gap-2 rounded-full px-5 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" style={{ animation: "pulseGlow 2s ease-in-out infinite" }} />
                    <span className="text-zinc-400 text-xs">
                      Total {members.length} anggota • Periode {period}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
