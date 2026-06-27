import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Create tables using raw SQL (PostgreSQL)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerifiedAt" TIMESTAMP(3),
        "password" TEXT NOT NULL,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "rememberToken" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Registration" (
        "id" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "nickname" TEXT,
        "gender" TEXT NOT NULL,
        "birthPlace" TEXT NOT NULL,
        "birthDate" TIMESTAMP(3) NOT NULL,
        "religion" TEXT,
        "address" TEXT NOT NULL,
        "city" TEXT,
        "province" TEXT,
        "postalCode" TEXT,
        "whatsapp" TEXT NOT NULL,
        "email" TEXT,
        "class" TEXT NOT NULL,
        "major" TEXT NOT NULL,
        "bloodType" TEXT,
        "medicalHistory" TEXT,
        "organizationExperience" TEXT,
        "motivation" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
      )
    `)

    // Create unique indexes
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Registration_whatsapp_key" ON "Registration"("whatsapp")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Registration_email_key" ON "Registration"("email")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Registration_status_idx" ON "Registration"("status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Registration_createdAt_idx" ON "Registration"("createdAt")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Registration_status_createdAt_idx" ON "Registration"("status", "createdAt")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key")`)

    // Seed admin
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const admin = await prisma.user.upsert({
      where: { email: "admin@parstama.id" },
      update: { isAdmin: true, password: hashedPassword },
      create: {
        email: "admin@parstama.id",
        name: "Admin PARSTAMA",
        password: hashedPassword,
        isAdmin: true,
        emailVerifiedAt: new Date(),
      },
    })

    // Seed settings
    await prisma.setting.upsert({
      where: { key: "registration_open" },
      update: { value: "1" },
      create: { key: "registration_open", value: "1" },
    })

    return NextResponse.json({
      success: true,
      message: "Database migrated & seeded!",
      admin: { email: admin.email, name: admin.name },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}