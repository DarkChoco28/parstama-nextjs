import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    secureCookie: process.env.VERCEL === "1" || String(req.url).startsWith("https"),
  })

  if (!token?.isAdmin) {
    const signInUrl = new URL("/login", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}