import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

function log(...args: any[]) {
  try {
    console.log("[AUTH]", ...args)
  } catch {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        log("authorize called", credentials?.email ? "email present" : "no email")

        if (!credentials?.email || !credentials?.password) {
          log("missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            log("user not found", credentials.email)
            return null
          }

          if (!user.isAdmin) {
            log("user not admin", credentials.email)
            return null
          }

          log("user found", user.email, "hash starts with", user.password.substring(0, 10))

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          log("password valid:", isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
          }
        } catch (e: any) {
          log("authorize error:", e.message)
          throw e
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
}
