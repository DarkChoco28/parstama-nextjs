import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@parstama.id" },
    update: {
      isAdmin: true,
      password: hashedPassword,
    },
    create: {
      email: "admin@parstama.id",
      name: "Admin PMR PARSTAMA",
      password: hashedPassword,
      isAdmin: true,
      emailVerifiedAt: new Date(),
    },
  })

  console.log("Admin user created:", admin)

  const setting = await prisma.setting.upsert({
    where: { key: "registration_open" },
    update: { value: "1" },
    create: {
      key: "registration_open",
      value: "1",
    },
  })

  console.log("Setting created:", setting)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })