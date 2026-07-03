import { prisma } from "@/lib/prisma"

export async function createAuditLog(params: {
  action: string
  userId?: string
  userEmail?: string
  details?: string
  ip?: string
}) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    console.error("Failed to create audit log")
  }
}
