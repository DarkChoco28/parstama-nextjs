import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const [tokenSetting, chatIdSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "telegram_bot_token" } }),
      prisma.setting.findUnique({ where: { key: "telegram_chat_id" } }),
    ])

    return NextResponse.json({
      botToken: tokenSetting?.value || "",
      chatId: chatIdSetting?.value || "",
    })
  } catch (error) {
    console.error("Error fetching Telegram settings:", error)
    return NextResponse.json({ error: "Gagal mengambil setting Telegram" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { botToken, chatId } = body as { botToken: string; chatId: string }

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Bot Token dan Chat ID wajib diisi" }, { status: 400 })
    }

    await Promise.all([
      prisma.setting.upsert({
        where: { key: "telegram_bot_token" },
        update: { value: botToken },
        create: { key: "telegram_bot_token", value: botToken },
      }),
      prisma.setting.upsert({
        where: { key: "telegram_chat_id" },
        update: { value: chatId },
        create: { key: "telegram_chat_id", value: chatId },
      }),
    ])

    createAuditLog({
      action: "update_telegram_settings",
      userEmail: auth.session?.user?.email || "admin",
      details: "Telegram bot settings updated",
    })

    return NextResponse.json({ message: "Setting Telegram berhasil disimpan" })
  } catch (error) {
    console.error("Error saving Telegram settings:", error)
    return NextResponse.json({ error: "Gagal menyimpan setting Telegram" }, { status: 500 })
  }
}
