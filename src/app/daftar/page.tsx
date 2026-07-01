"use client"

import { useState } from "react"
import Link from "next/link"

export default function DaftarPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    nickname: "",
    gender: "",
    birthPlace: "",
    birthDate: "",
    religion: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    whatsapp: "",
    email: "",
    class: "",
    major: "",
    bloodType: "",
    medicalHistory: "",
    organizationExperience: "",
    motivation: "",
  })
  const [agree, setAgree] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === "radio" ? (e.target as HTMLInputElement).value : value
    setFormData(prev => ({ ...prev, [name]: val }))
    setFieldErrors(prev => ({ ...prev, [name]: false }))
  }

  const markError = (id: string, errId: string) => {
    setFieldErrors(prev => ({ ...prev, [id]: true }))
  }

  const validateStep = (step: number) => {
    let ok = true
    setFieldErrors({})
    if (step === 1) {
      if (!formData.fullName.trim()) { markError("fullName", "err-fullName"); ok = false }
      if (!formData.gender) { markError("gender", "err-gender"); ok = false }
      if (!formData.birthPlace.trim()) { markError("birthPlace", "err-birthPlace"); ok = false }
      if (!formData.birthDate) { markError("birthDate", "err-birthDate"); ok = false }
    }
    if (step === 2) {
      if (!formData.whatsapp.trim()) { markError("whatsapp", "err-whatsapp"); ok = false }
      if (!formData.address.trim()) { markError("address", "err-address"); ok = false }
      if (!formData.class.trim()) { markError("class", "err-class"); ok = false }
      if (!formData.major.trim()) { markError("major", "err-major"); ok = false }
    }
    if (step === 3) {
      if (formData.motivation.trim().length < 20) { markError("motivation", "err-motivation"); ok = false }
    }
    return ok
  }

  const goToStep = (step: number) => {
    if (step > currentStep && !validateStep(currentStep)) return
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agree) { setFieldErrors(prev => ({ ...prev, agree: true })); return }
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, parentConsent: agree }),
      })
      if (response.ok) {
        window.location.href = "/daftar/berhasil"
      } else {
        const data = await response.json()
        setErrorMsg(data.error || "Terjadi kesalahan saat mendaftar")
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat mendaftar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const genderLabel = () => formData.gender === "L" ? "Laki-laki" : formData.gender === "P" ? "Perempuan" : "-"
  const classMajorLabel = () => formData.class && formData.major ? `${formData.class} / ${formData.major}` : (formData.class || formData.major || "-")

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "Sansita, Georgia, serif, -apple-system, sans-serif", fontSize: "16.2px", lineHeight: 1.5, color: "#E0E0E0" }}>
      {/* Floating Emoji Medis */}
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "18%", left: "88%", fontSize: "22px", animation: "emojiFloat1 9s ease-in-out infinite 0s" }}>🩺</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "35%", left: "6%", fontSize: "18px", animation: "emojiFloat2 12s ease-in-out infinite 1s" }}>🩹</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "62%", left: "82%", fontSize: "20px", animation: "emojiFloat3 10s ease-in-out infinite 2s" }}>💉</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "75%", left: "25%", fontSize: "16px", animation: "emojiFloat1 11s ease-in-out infinite 3s" }}>🫀</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "22%", left: "55%", fontSize: "14px", animation: "emojiFloat2 8s ease-in-out infinite 0.5s" }}>🚑</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "88%", left: "45%", fontSize: "18px", animation: "emojiFloat3 13s ease-in-out infinite 1.5s" }}>🩻</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "50%", left: "18%", fontSize: "15px", animation: "emojiSpin 14s ease-in-out infinite 4s" }}>💊</div>
      <div className="fixed pointer-events-none z-0 select-none" style={{ top: "8%", left: "70%", fontSize: "13px", animation: "emojiFloat1 7s ease-in-out infinite 2.5s" }}>🩸</div>

      {/* 3D Red Crosses Background */}
      <div className="bg-cross-3d" style={{ width: "28px", height: "28px", top: "10%", left: "5%", animation: "cross3D_A 14s ease-in-out infinite 0s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "22px", height: "22px", top: "80%", left: "13%", animation: "cross3D_C 17s ease-in-out infinite 3s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "30px", height: "30px", top: "70%", left: "90%", animation: "cross3D_B 11s ease-in-out infinite 1.5s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "20px", height: "20px", top: "15%", left: "78%", animation: "cross3D_D 9s ease-in-out infinite 0.5s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "38px", height: "38px", top: "45%", left: "95%", animation: "cross3D_E 13s ease-in-out infinite 2s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "25px", height: "25px", top: "30%", left: "2%", animation: "cross3D_B 15s ease-in-out infinite 4s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "44px", height: "44px", top: "55%", left: "50%", animation: "cross3D_A 20s ease-in-out infinite 1s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "18px", height: "18px", top: "5%", left: "45%", animation: "cross3D_D 10s ease-in-out infinite 2.5s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "34px", height: "34px", top: "90%", left: "60%", animation: "cross3D_C 16s ease-in-out infinite 0.8s" }}><CrossSvg /></div>
      <div className="bg-cross-3d" style={{ width: "16px", height: "16px", top: "40%", left: "30%", animation: "cross3D_E 8s ease-in-out infinite 3.5s" }}><CrossSvg /></div>

      {/* Navbar */}
      <nav className="daftar-nav">
        <div className="daftar-nav-inner">
          <Link href="/" className="daftar-nav-logo">
            <div className="daftar-nav-logo-wrap"><img src="/smkn_logo.png" alt="SMKN" className="daftar-nav-logo-img" /></div>
            <div className="daftar-nav-logo-wrap"><img src="/parstama_logo.png" alt="PARSTAMA" className="daftar-nav-logo-img" /></div>
            <span className="daftar-nav-brand">PARSTAMA</span>
          </Link>
          <div className="daftar-nav-links-desktop">
            <Link href="/" className="daftar-nav-link">← Beranda</Link>
            <Link href="/cek-status" className="daftar-nav-link">💬 Tanya AI</Link>
            <Link href="/login" className="daftar-nav-admin">Login Admin</Link>
          </div>
          <button className="daftar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="daftar-mobile-menu">
            <Link href="/" className="daftar-mobile-link" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
              Beranda
            </Link>
            <Link href="/cek-status" className="daftar-mobile-link" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              💬 Tanya AI
            </Link>
            <Link href="/login" className="daftar-mobile-link daftar-mobile-admin" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Login Admin
            </Link>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <div className="daftar-page-wrap">
        <div className="daftar-page-header">
          <div className="page-badge">Pendaftaran Anggota 2026/2027</div>
          <h1 className="page-title">Formulir <span>Pendaftaran</span></h1>
          <p className="page-sub">Isi data diri Anda dengan lengkap dan benar. Proses pendaftaran hanya memerlukan beberapa menit.</p>
        </div>

        {/* Steps Bar */}
        <div className="steps-bar">
          {[
            { icon: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8", label: "Data Diri", shortLabel: "Data" },
            { icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", label: "Kontak & Sekolah", shortLabel: "Kontak" },
            { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", label: "Motivasi", shortLabel: "Motivasi" },
            { icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01 9 11.01", label: "Konfirmasi", shortLabel: "Konfirmasi" },
          ].map((s, i) => {
            const stepNum = i + 1
            const isActive = currentStep === stepNum
            const isDone = currentStep > stepNum
            return (
              <div key={s.label} className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
                <span className="step-num">{isDone ? "✓" : stepNum}</span>
                <span className="step-label-desktop">{s.label}</span>
                <span className="step-label-mobile">{s.shortLabel}</span>
              </div>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="form-card">
          {errorMsg && (
            <div className="alert-closed">⚠ {errorMsg}</div>
          )}

          {currentStep === 1 && (
            <div className="form-section active">
              <div className="section-heading">Data Diri</div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Nama Lengkap <span className="req">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Sesuai kartu identitas" className={fieldErrors.fullName ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.fullName ? " show" : ""}`}>Nama lengkap wajib diisi.</span>
                </div>
                <div className="form-group">
                  <label>Nama Panggilan</label>
                  <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="Opsional" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Jenis Kelamin <span className="req">*</span></label>
                  <div className="radio-group" id="gender-group">
                    <label className={`radio-opt${formData.gender === "L" ? " checked" : ""}`}>
                      <input type="radio" name="gender" value="L" checked={formData.gender === "L"} onChange={handleInputChange} />
                      <span>Laki-laki</span>
                    </label>
                    <label className={`radio-opt${formData.gender === "P" ? " checked" : ""}`}>
                      <input type="radio" name="gender" value="P" checked={formData.gender === "P"} onChange={handleInputChange} />
                      <span>Perempuan</span>
                    </label>
                  </div>
                  <span className={`error-msg${fieldErrors.gender ? " show" : ""}`}>Jenis kelamin wajib dipilih.</span>
                </div>
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Tempat Lahir <span className="req">*</span></label>
                  <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} placeholder="Kota tempat lahir" className={fieldErrors.birthPlace ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.birthPlace ? " show" : ""}`}>Tempat lahir wajib diisi.</span>
                </div>
                <div className="form-group">
                  <label>Tanggal Lahir <span className="req">*</span></label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={fieldErrors.birthDate ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.birthDate ? " show" : ""}`}>Tanggal lahir wajib diisi.</span>
                </div>
              </div>
              <div className="form-nav" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn-next" onClick={() => goToStep(2)}>Selanjutnya →</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-section active">
              <div className="section-heading">Kontak & Data Sekolah</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nomor WhatsApp <span className="req">*</span></label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="08xxxxxxxxxx" className={fieldErrors.whatsapp ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.whatsapp ? " show" : ""}`}>Nomor WhatsApp wajib diisi.</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Alamat Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contoh@email.com" />
                  <span className="char-hint">Opsional — untuk menerima informasi seleksi</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Alamat Lengkap <span className="req">*</span></label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota" className={fieldErrors.address ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.address ? " show" : ""}`}>Alamat wajib diisi.</span>
                </div>
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Kelas <span className="req">*</span></label>
                  <input type="text" name="class" value={formData.class} onChange={handleInputChange} placeholder="Contoh: X / 10" className={fieldErrors.class ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.class ? " show" : ""}`}>Kelas wajib diisi.</span>
                </div>
                <div className="form-group">
                  <label>Jurusan <span className="req">*</span></label>
                  <input type="text" name="major" value={formData.major} onChange={handleInputChange} placeholder="Contoh: TAB 1 / TAB 2 / TAB 3" className={fieldErrors.major ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.major ? " show" : ""}`}>Jurusan wajib dipilih.</span>
                </div>
              </div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => goToStep(1)}>← Kembali</button>
                <button type="button" className="btn-next" onClick={() => goToStep(3)}>Selanjutnya →</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-section active">
              <div className="section-heading">Motivasi</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Alasan Bergabung dengan PARSTAMA <span className="req">*</span></label>
                  <textarea name="motivation" value={formData.motivation} onChange={handleInputChange} placeholder="Ceritakan alasan Anda ingin bergabung, pengalaman yang diharapkan, dan kontribusi yang ingin diberikan..." style={{ minHeight: 180 }} className={fieldErrors.motivation ? "error" : ""} />
                  <span className={`error-msg${fieldErrors.motivation ? " show" : ""}`}>Kolom motivasi wajib diisi (minimal 20 karakter).</span>
                  <span className="char-hint" style={{ color: formData.motivation.length >= 20 ? "#F97316" : "#555" }}>{formData.motivation.length} karakter{formData.motivation.length < 20 ? " (min. 20)" : " ok"}</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pengalaman Organisasi Sebelumnya</label>
                  <textarea name="organizationExperience" value={formData.organizationExperience} onChange={handleInputChange} placeholder="Tuliskan pengalaman organisasi Anda sebelumnya. Kosongkan jika tidak ada." style={{ minHeight: 110 }} />
                  <span className="char-hint">Opsional — pengalaman tidak wajib</span>
                </div>
              </div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => goToStep(2)}>← Kembali</button>
                <button type="button" className="btn-next" onClick={() => goToStep(4)}>Selanjutnya →</button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleSubmit}>
              <div className="form-section active">
                <div className="section-heading">Konfirmasi Data</div>
                <div className="sum-table">
                  <div className="sum-row"><span className="sum-key">Nama Lengkap</span><span className="sum-val">{formData.fullName}</span></div>
                  <div className="sum-row"><span className="sum-key">Jenis Kelamin</span><span className="sum-val">{genderLabel()}</span></div>
                  <div className="sum-row"><span className="sum-key">Tempat, Tanggal Lahir</span><span className="sum-val">{formData.birthPlace}{formData.birthPlace && formData.birthDate ? ", " : ""}{formData.birthDate}</span></div>
                  <div className="sum-row"><span className="sum-key">WhatsApp</span><span className="sum-val">{formData.whatsapp}</span></div>
                  <div className="sum-row"><span className="sum-key">Kelas / Jurusan</span><span className="sum-val">{classMajorLabel()}</span></div>
                  <div className="sum-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="sum-key">Motivasi</span>
                    <div className="sum-motivation">{formData.motivation.length > 250 ? formData.motivation.substring(0, 250) + "..." : formData.motivation}</div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer" style={{ fontSize: "14.4px", color: "#E0E0E0", marginBottom: 24 }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, accentColor: "#E87A1A" }} />
                  <span>Saya menyatakan bahwa data yang saya isi adalah <strong style={{ color: "#3B82F6" }}>benar dan dapat dipertanggungjawabkan</strong>, sudah mendapatkan <strong style={{ color: "#fff" }}>izin dari orang tua / wali</strong>, serta bersedia mengikuti seluruh proses seleksi PARSTAMA.</span>
                </label>
                <span className={`error-msg${fieldErrors.agree ? " show" : ""}`} style={{ marginBottom: 16 }}>Anda harus menyetujui pernyataan dan persetujuan orang tua / wali di atas.</span>
                <div className="form-nav">
                  <button type="button" className="btn-ghost" onClick={() => goToStep(3)}>← Kembali</button>
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    <div className="spinner" style={{ display: isSubmitting ? "block" : "none" }} />
                    <span className="btn-text">{isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          <p className="form-hint">
            Sudah mendaftar? <Link href="/cek-status">💬 Tanya AI tentang pendaftaran</Link> atau <Link href="/">kembali ke beranda</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float3D { 0%,100% { transform: perspective(600px) rotateX(15deg) rotateY(-10deg) translateY(0px); } 50% { transform: perspective(600px) rotateX(-10deg) rotateY(15deg) translateY(-20px); } }
        @keyframes morphBlob { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes navLogoFloat3D { 0%,100% { transform: perspective(400px) rotateY(-12deg) rotateX(5deg) translateY(0px); } 25% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); } 50% { transform: perspective(400px) rotateY(12deg) rotateX(5deg) translateY(0px); } 75% { transform: perspective(400px) rotateY(0deg) rotateX(-5deg) translateY(-3px); } }
        @keyframes navGlowPulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } }
        @keyframes navCrossFloat1 { 0%,100% { transform: perspective(400px) rotateY(0deg) rotateX(0deg) translateY(0px); } 50% { transform: perspective(400px) rotateY(180deg) rotateX(20deg) translateY(-8px); } }
        @keyframes navCrossFloat2 { 0%,100% { transform: perspective(400px) rotateY(180deg) rotateX(-15deg) translateY(0px); } 50% { transform: perspective(400px) rotateY(360deg) rotateX(15deg) translateY(-6px); } }
        @keyframes cross3D_A { 0% { transform: perspective(900px) rotateY(0deg) rotateX(15deg) rotateZ(0deg) translateZ(0px) translateY(0px); opacity: .20; } 25% { transform: perspective(900px) rotateY(90deg) rotateX(-20deg) rotateZ(15deg) translateZ(60px) translateY(-25px); opacity: .40; } 50% { transform: perspective(900px) rotateY(180deg) rotateX(10deg) rotateZ(-10deg) translateZ(30px) translateY(-45px); opacity: .25; } 75% { transform: perspective(900px) rotateY(270deg) rotateX(-15deg) rotateZ(20deg) translateZ(70px) translateY(-15px); opacity: .45; } 100% { transform: perspective(900px) rotateY(360deg) rotateX(15deg) rotateZ(0deg) translateZ(0px) translateY(0px); opacity: .20; } }
        @keyframes cross3D_B { 0% { transform: perspective(700px) rotateY(180deg) rotateX(-12deg) rotateZ(10deg) translateZ(0px) translateY(0px); opacity: .18; } 30% { transform: perspective(700px) rotateY(270deg) rotateX(20deg) rotateZ(-15deg) translateZ(50px) translateY(-30px); opacity: .38; } 60% { transform: perspective(700px) rotateY(360deg) rotateX(-8deg) rotateZ(5deg) translateZ(80px) translateY(-10px); opacity: .45; } 100% { transform: perspective(700px) rotateY(540deg) rotateX(-12deg) rotateZ(10deg) translateZ(0px) translateY(0px); opacity: .18; } }
        @keyframes cross3D_C { 0% { transform: perspective(1000px) rotateY(45deg) rotateX(20deg) rotateZ(-20deg) translateZ(20px) translateY(0px) scale(1); opacity: .15; } 33% { transform: perspective(1000px) rotateY(165deg) rotateX(-15deg) rotateZ(10deg) translateZ(90px) translateY(-35px) scale(1.2); opacity: .40; } 66% { transform: perspective(1000px) rotateY(285deg) rotateX(25deg) rotateZ(-5deg) translateZ(40px) translateY(-20px) scale(.9); opacity: .28; } 100% { transform: perspective(1000px) rotateY(405deg) rotateX(20deg) rotateZ(-20deg) translateZ(20px) translateY(0px) scale(1); opacity: .15; } }
        @keyframes cross3D_D { 0% { transform: perspective(600px) rotateY(0deg) rotateX(0deg) rotateZ(45deg) translateZ(0px) translateY(0px); opacity: .22; } 50% { transform: perspective(600px) rotateY(240deg) rotateX(-30deg) rotateZ(-30deg) translateZ(100px) translateY(-50px); opacity: .50; } 100% { transform: perspective(600px) rotateY(360deg) rotateX(0deg) rotateZ(45deg) translateZ(0px) translateY(0px); opacity: .22; } }
        @keyframes cross3D_E { 0%,100% { transform: perspective(800px) rotateY(0deg) rotateX(30deg) scale(1) translateY(0px); opacity:.18; } 40% { transform: perspective(800px) rotateY(200deg) rotateX(-20deg) scale(1.3) translateY(-40px); opacity:.42; } 70% { transform: perspective(800px) rotateY(320deg) rotateX(15deg) scale(.8) translateY(-20px); opacity:.30; } }
        @keyframes emojiFloat1 { 0%,100% { transform: translateY(0px) rotate(0deg) scale(1); opacity:.25; } 25% { transform: translateY(-18px) rotate(8deg) scale(1.1); opacity:.45; } 50% { transform: translateY(-30px) rotate(-5deg) scale(.95); opacity:.30; } 75% { transform: translateY(-12px) rotate(12deg) scale(1.05);opacity:.40; } }
        @keyframes emojiFloat2 { 0%,100% { transform: translateY(0px) rotate(0deg) scale(1); opacity:.20; } 33% { transform: translateY(-25px) rotate(-10deg) scale(1.15);opacity:.45; } 66% { transform: translateY(-10px) rotate(6deg) scale(.9); opacity:.28; } }
        @keyframes emojiFloat3 { 0%,100% { transform: translateY(0px) rotate(0deg) scale(1); opacity:.22; } 40% { transform: translateY(-20px) rotate(15deg) scale(1.2); opacity:.50; } 70% { transform: translateY(-8px) rotate(-8deg) scale(.85); opacity:.25; } }
        @keyframes emojiSpin { 0%,100% { transform: rotate(0deg) scale(1); opacity:.22; } 50% { transform: rotate(180deg) scale(1.1); opacity:.45; } }
        @keyframes menuSlideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }

        *,*::before,*::after{box-sizing:border-box}
        .bg-cross-3d { position: fixed; pointer-events: none; z-index: 0; will-change: transform, opacity; transform-style: preserve-3d; }
        .bg-cross-3d svg { width: 100%; height: 100%; }

        /* NAVBAR */
        .daftar-nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,10,.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);animation:fadeDown .7s ease both}
        .daftar-nav-inner{display:flex;justify-content:space-between;align-items:center;padding:0 16px;height:60px}
        .daftar-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0}
        .daftar-nav-logo-wrap{position:relative;width:60px;height:60px;flex-shrink:0}
        .daftar-nav-logo-img{width:60px;height:60px;border-radius:50%;object-fit:contain;animation:navLogoFloat3D 6s ease-in-out infinite;box-shadow:0 0 8px rgba(232,122,26,.4)}
        .daftar-nav-brand{font-family:'Sansita',Georgia,serif;font-size:14px;font-weight:700;background:linear-gradient(90deg,#F97316,#E87A1A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap}
        .daftar-nav-links-desktop{display:flex;align-items:center;gap:16px}
        .daftar-nav-link{font-family:'Sansita',Georgia,serif,sans-serif;font-size:13px;font-weight:400;color:#888;text-decoration:none;letter-spacing:.5px;transition:color .2s}
        .daftar-nav-link:hover{color:#fff}
        .daftar-nav-admin{font-family:'Sansita',Georgia,serif,sans-serif;font-size:13px;color:#F97316;text-decoration:none;letter-spacing:.5px;padding:8px 18px;border:1px solid rgba(232,122,26,.3);border-radius:8px;transition:background .2s,box-shadow .2s}
        .daftar-nav-admin:hover{background:rgba(232,122,26,.08);box-shadow:0 0 12px rgba(232,122,26,.1)}
        .daftar-hamburger{display:none;background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px;color:rgba(255,255,255,.7);cursor:pointer;transition:all .3s}
        .daftar-hamburger:hover{background:rgba(255,255,255,.06);color:#fff}
        .daftar-mobile-menu{display:none;flex-direction:column;padding:8px 16px 16px;gap:4px;animation:menuSlideDown .2s ease}
        .daftar-mobile-link{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;color:rgba(255,255,255,.7);font-size:14px;font-weight:500;text-decoration:none;border:1px solid rgba(255,255,255,.06);transition:all .3s;background:rgba(255,255,255,.03);font-family:'Sansita',Georgia,serif,sans-serif}
        .daftar-mobile-link:active{background:rgba(255,255,255,.08)}
        .daftar-mobile-admin{color:#F97316;border-color:rgba(232,122,26,.15);background:rgba(232,122,26,.05)}

        /* PAGE */
        .daftar-page-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;padding:80px 16px 40px}
        .daftar-page-header{text-align:center;max-width:580px;margin-bottom:28px;animation:fadeUp .7s .2s ease both}
        .page-badge{display:inline-block;background:rgba(232,122,26,.12);border:1px solid rgba(232,122,26,.25);color:#F97316;font-family:'Sansita',Georgia,serif,sans-serif;font-size:11px;font-weight:400;letter-spacing:1.2px;text-transform:uppercase;padding:6px 16px;border-radius:50px;margin-bottom:12px}
        .page-title{font-family:'Sansita',Georgia,serif;font-size:24px;font-weight:700;margin-bottom:8px;color:#fff}
        .page-title span{background:linear-gradient(135deg,#F97316,#E87A1A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .page-sub{color:#888;font-size:13px;line-height:1.6}

        /* STEPS */
        .steps-bar{display:flex;gap:6px;justify-content:center;flex-wrap:nowrap;align-items:center;margin-bottom:28px;width:100%;max-width:620px;animation:fadeUp .7s .3s ease both;overflow-x:auto;padding:4px 0}
        .step-item{display:inline-flex;align-items:center;gap:6px;height:36px;border-radius:8px;background:rgba(255,255,255,.04);color:#555;border:1px solid rgba(255,255,255,.08);transition:background .3s,color .3s,border-color .3s,box-shadow .3s;flex-shrink:0;padding:0 10px}
        .step-item.active{background:linear-gradient(135deg,#E87A1A,#991B1B);color:#fff;border-color:#E87A1A;box-shadow:0 0 20px rgba(232,122,26,.3)}
        .step-item.done{background:rgba(232,122,26,.08);color:#F97316;border-color:rgba(232,122,26,.3)}
        .step-num{font-family:'Sansita',Georgia,serif;font-size:13px;font-weight:700;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.06);flex-shrink:0}
        .step-item.active .step-num{background:rgba(255,255,255,.2)}
        .step-item.done .step-num{background:rgba(232,122,26,.15)}
        .step-label-desktop{font-family:'Sansita',Georgia,serif,sans-serif;font-size:12px;font-weight:400;letter-spacing:.3px;white-space:nowrap}
        .step-label-mobile{display:none;font-family:'Sansita',Georgia,serif,sans-serif;font-size:11px;font-weight:400;letter-spacing:.3px;white-space:nowrap}

        /* FORM */
        .form-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px 16px;width:100%;max-width:680px;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:fadeUp .7s .4s ease both;position:relative;overflow:hidden}
        .form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E87A1A,transparent)}
        .form-section{display:none}
        .form-section.active{display:block;animation:slideIn .4s ease both}
        .section-heading{font-family:'Sansita',Georgia,serif;font-size:16px;font-weight:700;color:#F97316;display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.06)}
        .form-row{display:grid;gap:14px;grid-template-columns:1fr;margin-bottom:14px}
        .form-row.two-col{grid-template-columns:1fr}
        .form-group{display:flex;flex-direction:column;gap:5px}
        label{font-size:13px;font-weight:600;color:#ccc;letter-spacing:.3px}
        label .req{color:#F97316;margin-left:2px}
        input[type="text"],input[type="email"],input[type="tel"],input[type="date"],select,textarea{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-family:'Sansita',Georgia,serif,-apple-system,sans-serif;font-size:15px;padding:12px 14px;transition:border-color .25s,box-shadow .25s;outline:none;width:100%;-webkit-appearance:none}
        input::placeholder,textarea::placeholder{color:#555}
        input:focus,select:focus,textarea:focus{border-color:#E87A1A;box-shadow:0 0 0 2px rgba(232,122,26,.15)}
        input.error,select.error,textarea.error{border-color:#F97316;animation:shake .4s ease}
        select option{background:#1a1a1a;color:#fff}
        textarea{resize:vertical;min-height:90px}
        .radio-group{display:flex;gap:10px;flex-wrap:wrap}
        .radio-opt{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px 14px;cursor:pointer;transition:border-color .2s,background .2s;flex:1;min-width:0}
        .radio-opt input[type="radio"]{accent-color:#E87A1A;width:16px;height:16px}
        .radio-opt.checked{border-color:#E87A1A;background:rgba(232,122,26,.06);box-shadow:0 0 12px rgba(232,122,26,.1)}
        .radio-opt span{font-size:13px;font-weight:600;color:#ccc}
        .error-msg{font-size:12px;color:#F97316;margin-top:3px;display:none}
        .error-msg.show{display:block}
        .alert-closed{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.3);border-radius:8px;padding:14px 16px;margin-bottom:16px;color:#F59E0B;font-size:13px;text-align:center}
        .form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:20px;gap:12px}
        .btn-ghost{background:transparent;color:#aaa;border:1px solid rgba(255,255,255,.1);font-family:'Sansita',Georgia,serif,-apple-system,sans-serif;font-weight:600;font-size:13px;padding:12px 20px;border-radius:8px;cursor:pointer;transition:border-color .2s,color .2s}
        .btn-ghost:hover{border-color:#F97316;color:#F97316}
        .btn-next,.btn-submit{background:linear-gradient(135deg,#E87A1A,#991B1B);color:#fff;border:none;font-family:'Sansita',Georgia,serif,-apple-system,sans-serif;font-weight:600;font-size:13px;padding:12px 20px;border-radius:8px;cursor:pointer;transition:opacity .2s,transform .2s,box-shadow .2s;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(232,122,26,.3)}
        .btn-next:hover,.btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(232,122,26,.45)}
        .btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none!important}
        .btn-submit .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        .char-hint{font-size:12px;color:#555;margin-top:3px}
        .form-hint{text-align:center;font-size:13px;color:#555;margin-top:16px}
        .form-hint a{color:#F97316;text-decoration:none}
        .form-hint a:hover{text-decoration:underline}
        .sum-table{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px}
        .sum-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);gap:12px}
        .sum-row:last-child{border-bottom:none}
        .sum-key{color:#888;flex-shrink:0;min-width:100px;font-family:'Sansita',Georgia,serif,sans-serif;font-size:12px}
        .sum-val{color:#fff;font-weight:600;text-align:right;word-break:break-word;font-size:13px}
        .sum-motivation{color:#ccc;font-style:italic;line-height:1.6;margin-top:4px;font-size:13px}

        @media(min-width:640px){
          .daftar-nav-inner{padding:0 24px;height:68px}
          .daftar-nav-logo-wrap{width:64px;height:64px}
          .daftar-nav-logo-img{width:64px;height:64px}
          .daftar-nav-brand{font-size:16px}
          .daftar-page-wrap{padding:92px 28px 52px}
          .page-title{font-size:30px}
          .page-sub{font-size:14px}
          .page-badge{font-size:12px;padding:8px 20px}
          .form-card{padding:36px 32px}
          .form-row.two-col{grid-template-columns:repeat(2,1fr)}
          .section-heading{font-size:18px}
          .steps-bar{gap:8px}
          .step-item{height:40px;padding:0 14px}
          .step-label-desktop{display:inline}
          .step-label-mobile{display:none}
        }

        @media(min-width:768px){
          .daftar-hamburger{display:none!important}
          .daftar-mobile-menu{display:none!important}
          .daftar-nav-links-desktop{display:flex!important}
        }

        @media(max-width:767px){
          .daftar-nav-links-desktop{display:none}
          .daftar-hamburger{display:flex}
          .daftar-mobile-menu{display:flex}
          .step-label-desktop{display:none}
          .step-label-mobile{display:inline}
          .step-item{padding:0 8px;height:34px}
          .step-num{width:22px;height:22px;font-size:12px}
          .form-card{padding:20px 16px}
          .form-nav{flex-direction:column}
          .btn-ghost,.btn-next,.btn-submit{width:100%;justify-content:center;padding:14px}
          .sum-row{flex-direction:column;gap:4px}
          .sum-key{min-width:0}
          .sum-val{text-align:left}
          .radio-group{flex-direction:column}
          .radio-opt{min-width:0}
        }

        @media(max-width:380px){
          .daftar-nav-inner{height:56px;padding:0 12px}
          .daftar-nav-logo-wrap{width:28px;height:28px}
          .daftar-nav-logo-img{width:28px;height:28px}
          .daftar-nav-brand{font-size:13px}
          .daftar-page-wrap{padding:72px 12px 32px}
          .page-title{font-size:20px}
          .page-sub{font-size:12px}
          .form-card{padding:16px 12px}
          .step-item{height:32px;padding:0 6px}
          .step-num{width:20px;height:20px;font-size:11px}
          .step-label-mobile{font-size:10px}
          .section-heading{font-size:15px;margin-bottom:14px}
          label{font-size:12px}
          input[type="text"],input[type="email"],input[type="tel"],input[type="date"],select,textarea{font-size:14px;padding:11px 12px}
        }
      `}</style>
    </div>
  )
}

function CrossSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="#E87A1A">
      <rect x="9" y="2" width="6" height="20" rx="1.5" />
      <rect x="2" y="9" width="20" height="6" rx="1.5" />
    </svg>
  )
}
