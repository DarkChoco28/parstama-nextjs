import { z } from "zod"

export const GenderEnum = z.enum(["L", "P"])
export const StatusEnum = z.enum(["pending", "accepted", "rejected"])
export const BloodTypeEnum = z.enum(["A", "B", "AB", "O"]).or(z.string()).optional()

export const registrationSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi").trim(),
  nickname: z.string().optional(),
  gender: GenderEnum,
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi").trim(),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  religion: z.string().optional(),
  address: z.string().min(1, "Alamat wajib diisi").trim(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid").max(20).trim(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  class: z.string().min(1, "Kelas wajib diisi").trim(),
  major: z.string().min(1, "Jurusan wajib diisi").trim(),
  bloodType: BloodTypeEnum,
  medicalHistory: z.string().optional(),
  organizationExperience: z.string().optional(),
  motivation: z.string().min(20, "Motivasi minimal 20 karakter").trim(),
  parentConsent: z.boolean().refine((v) => v === true, {
    message: "Persetujuan orang tua wajib disetujui",
  }),
})

export const visionSchema = z.object({
  image: z.string().min(100, "Gambar tidak valid"),
  message: z.string().optional(),
})

export const eventSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").trim(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  isVisible: z.boolean().optional(),
})
