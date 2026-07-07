import { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { checkRateLimit } from "@/lib/rate-limit"

const handler = NextAuth(authOptions)

async function rateLimitedHandler(request: NextRequest, ...args: any[]) {
  if (request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed } = await checkRateLimit(`auth:${ip}`, 5, 60000)
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Terlalu banyak percobaan login. Coba lagi nanti." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
  return handler(request, ...args)
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST }
