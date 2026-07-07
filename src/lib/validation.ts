import { z } from "zod"

export const StatusEnum = z.enum(["pending", "accepted", "rejected"])

export const visionSchema = z.object({
  image: z.string().min(100, "Gambar tidak valid"),
  message: z.string().optional(),
})

export const statusUpdateSchema = z.object({
  status: StatusEnum,
})

export const notificationSchema = z.object({
  registrationId: z.string().min(1, "Registration ID wajib diisi"),
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
