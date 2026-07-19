import { describe, it, expect } from "vitest"
import { registrationSchema } from "../validation"

describe("registrationSchema", () => {
  const validData = {
    fullName: "Budi Santoso",
    gender: "L",
    birthPlace: "Malang",
    birthDate: "2008-05-15",
    address: "Jl. Merdeka No. 10",
    whatsapp: "081234567890",
    class: "X",
    major: "TKJ",
    motivation: "Saya ingin belajar P3K dan membantu sesama di SMKN 1 Singosari",
    parentConsent: true,
  }

  it("accepts valid data", () => {
    const result = registrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects empty fullName", () => {
    const result = registrationSchema.safeParse({ ...validData, fullName: "" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid gender", () => {
    const result = registrationSchema.safeParse({ ...validData, gender: "X" })
    expect(result.success).toBe(false)
  })

  it("rejects short motivation", () => {
    const result = registrationSchema.safeParse({ ...validData, motivation: "Singkat" })
    expect(result.success).toBe(false)
  })

  it("rejects short whatsapp", () => {
    const result = registrationSchema.safeParse({ ...validData, whatsapp: "123" })
    expect(result.success).toBe(false)
  })

  it("rejects false parentConsent", () => {
    const result = registrationSchema.safeParse({ ...validData, parentConsent: false })
    expect(result.success).toBe(false)
  })

  it("allows optional fields to be undefined", () => {
    const result = registrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nickname).toBeUndefined()
      expect(result.data.religion).toBeUndefined()
      expect(result.data.bloodType).toBeUndefined()
    }
  })
})
