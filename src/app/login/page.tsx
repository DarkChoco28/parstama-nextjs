"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "600px",
          height: "600px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)",
          animation: "loginPulseGlow 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Scan lines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes loginPulseGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes loginCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes loginBorderGlow {
          0%, 100% { border-color: rgba(220, 38, 38, 0.15); }
          50% { border-color: rgba(220, 38, 38, 0.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loginCross1 {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.12; }
          33% { transform: translate3d(8px,-5px,0) rotate(5deg); opacity: 0.2; }
          66% { transform: translate3d(-3px,8px,0) rotate(-3deg); opacity: 0.15; }
        }
        @keyframes loginCross2 {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.1; }
          33% { transform: translate3d(-6px,7px,0) rotate(-4deg); opacity: 0.18; }
          66% { transform: translate3d(5px,-4px,0) rotate(6deg); opacity: 0.12; }
        }
        @keyframes loginCross3 {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.15; }
          33% { transform: translate3d(4px,6px,0) rotate(3deg); opacity: 0.22; }
          66% { transform: translate3d(-7px,-3px,0) rotate(-5deg); opacity: 0.13; }
        }
        @media (max-width: 380px) {
          .login-card-header { padding: 24px 20px 0 !important; }
          .login-card-form { padding: 20px !important; }
        }
      `}</style>

      {/* Floating 3D crosses */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "28px",
          height: "28px",
          animation: "loginCross1 8s ease-in-out infinite",
          zIndex: 0,
        }}
      >
        <div style={{ position: "absolute", width: "100%", height: "3px", background: "linear-gradient(90deg, transparent, #DC2626, transparent)", top: "50%", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", height: "100%", width: "3px", background: "linear-gradient(180deg, transparent, #DC2626, transparent)", left: "50%", transform: "translateX(-50%)", borderRadius: "2px" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: "25%",
          right: "12%",
          width: "22px",
          height: "22px",
          animation: "loginCross2 10s ease-in-out infinite 1s",
          zIndex: 0,
        }}
      >
        <div style={{ position: "absolute", width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, #DC2626, transparent)", top: "50%", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", height: "100%", width: "2px", background: "linear-gradient(180deg, transparent, #DC2626, transparent)", left: "50%", transform: "translateX(-50%)", borderRadius: "2px" }} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "15%",
          width: "20px",
          height: "20px",
          animation: "loginCross3 9s ease-in-out infinite 2s",
          zIndex: 0,
        }}
      >
        <div style={{ position: "absolute", width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, #DC2626, transparent)", top: "50%", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", height: "100%", width: "2px", background: "linear-gradient(180deg, transparent, #DC2626, transparent)", left: "50%", transform: "translateX(-50%)", borderRadius: "2px" }} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "8%",
          width: "25px",
          height: "25px",
          animation: "loginCross1 11s ease-in-out infinite 3s",
          zIndex: 0,
        }}
      >
        <div style={{ position: "absolute", width: "100%", height: "3px", background: "linear-gradient(90deg, transparent, #DC2626, transparent)", top: "50%", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", height: "100%", width: "3px", background: "linear-gradient(180deg, transparent, #DC2626, transparent)", left: "50%", transform: "translateX(-50%)", borderRadius: "2px" }} />
      </div>

      <div style={{ maxWidth: "420px", width: "100%", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div
          style={{
            background: "rgba(20, 20, 22, 0.9)",
            backdropFilter: "blur(24px)",
            borderRadius: "24px",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(220,38,38,0.08), 0 25px 50px rgba(0,0,0,0.5)",
            animation: "loginCardFloat 6s ease-in-out infinite, loginBorderGlow 3s ease-in-out infinite",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, transparent, #DC2626, #EF4444, #DC2626, transparent)",
            }}
          />

          {/* Header */}
          <div className="login-card-header" style={{ padding: "32px 32px 0", textAlign: "center" }}>
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ position: "relative", width: "48px", height: "48px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)",
                  }}
                />
                <img
                  src="/smkn_logo.png"
                  alt="SMKN"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "contain",
                    boxShadow: "0 0 12px rgba(220,38,38,0.3)",
                  }}
                />
              </div>
              <div style={{ position: "relative", width: "48px", height: "48px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)",
                  }}
                />
                <img
                  src="/parstama_logo.png"
                  alt="PARSTAMA"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "contain",
                    boxShadow: "0 0 12px rgba(220,38,38,0.3)",
                  }}
                />
              </div>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-sansita), Georgia, serif",
                fontSize: "24px",
                fontWeight: 700,
                background: "linear-gradient(90deg, #EF4444, #DC2626)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}
            >
              Login Admin
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginTop: "8px", marginBottom: 0 }}>
              PARSTAMA &mdash; SMA Negeri
            </p>
          </div>

          {/* Form */}
          <div className="login-card-form" style={{ padding: "28px 32px 32px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {error && (
                <div
                  style={{
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    color: "#EF4444",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@parstama.id"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.5)"
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(220,38,38,0.15)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.5)"
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(220,38,38,0.15)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: isLoading ? "rgba(220,38,38,0.5)" : "linear-gradient(135deg, #DC2626, #EF4444)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  letterSpacing: "0.5px",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(220,38,38,0.4)"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Memproses...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              <a
                href="https://wa.me/6285731663004"
                target="_blank"
                rel="noopener"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
              >
                Hubungi panitia: WA 0857-3166-3004
              </a>
              <Link
                href="/"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "color 0.3s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                </svg>
                Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}