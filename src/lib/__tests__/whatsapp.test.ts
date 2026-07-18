import { describe, it, expect } from "vitest"
import { buildStatusWhatsApp } from "../whatsapp"

describe("buildStatusWhatsApp", () => {
  it("includes DITERIMA for accepted status", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "budi@test.com", "accepted")
    expect(msg).toContain("*Status: DITERIMA*")
    expect(msg).toContain("*DITERIMA*")
    expect(msg).toContain("Bergabunglah ke grup WhatsApp")
    expect(msg).toContain("https://chat.whatsapp.com/")
  })

  it("includes DITOLAK for rejected status", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "", "rejected")
    expect(msg).toContain("*Status: DITOLAK*")
    expect(msg).not.toContain("https://chat.whatsapp.com/")
  })

  it("includes MENUNGGU for pending status", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "", "pending")
    expect(msg).toContain("*Status: MENUNGGU*")
    expect(msg).not.toContain("https://chat.whatsapp.com/")
  })

  it("includes recipient name", () => {
    const msg = buildStatusWhatsApp("Budi Santoso", "X", "TKJ", "081234567890", "", "accepted")
    expect(msg).toContain("Halo Budi Santoso")
  })

  it("includes data section", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "budi@test.com", "accepted")
    expect(msg).toContain("Nama: Budi")
    expect(msg).toContain("Kelas: X - TKJ")
    expect(msg).toContain("WhatsApp: 081234567890")
    expect(msg).toContain("Email: budi@test.com")
  })

  it("includes humas numbers", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "", "accepted")
    expect(msg).toContain("0814-5914-5800")
    expect(msg).toContain("0838-2379-7912")
  })

  it("handles empty email", () => {
    const msg = buildStatusWhatsApp("Budi", "X", "TKJ", "081234567890", "", "accepted")
    expect(msg).toContain("Email: -")
  })
})
