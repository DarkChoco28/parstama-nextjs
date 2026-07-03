import { prisma } from "@/lib/prisma"

export async function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const now = new Date()
    const record = await prisma.rateLimit.findUnique({ where: { key } })

    if (!record || now > record.expiresAt) {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, expiresAt: new Date(now.getTime() + windowMs) },
        create: { key, count: 1, expiresAt: new Date(now.getTime() + windowMs) },
      })
      return { allowed: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })

    return { allowed: true, remaining: maxRequests - record.count - 1 }
  } catch {
    // Fallback: allow request on DB error
    return { allowed: true, remaining: maxRequests }
  }
}
