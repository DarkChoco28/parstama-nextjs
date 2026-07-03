import { z } from "zod"

export const GenderEnum = z.enum(["L", "P"])
export const StatusEnum = z.enum(["pending", "accepted", "rejected"])
export const BloodTypeEnum = z.enum(["A", "B", "AB", "O"]).or(z.string()).optional()
export const ReligionEnum = z.string().optional()

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

export const statusCheckSchema = z.object({
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
})

export const chatSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong").trim(),
})

export const visionSchema = z.object({
  image: z.string().min(100, "Gambar tidak valid"),
  message: z.string().optional(),
})

export const statusUpdateSchema = z.object({
  registrationId: z.string().min(1, "Registration ID wajib diisi"),
  status: StatusEnum.optional(),
})

export const articleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").trim(),
  slug: z.string().min(1, "Slug wajib diisi").trim(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Konten wajib diisi"),
  coverImage: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
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

export const organizationMemberSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").trim(),
  nickname: z.string().optional(),
  position: z.string().min(1, "Posisi wajib diisi").trim(),
  division: z.string().optional(),
  divisionDesc: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
  level: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
  period: z.string().optional(),
  isVisible: z.boolean().optional(),
})

export const settingsSchema = z.object({
  value: z.string().min(1),
})
