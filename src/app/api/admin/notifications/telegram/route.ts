import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { sendTelegramMessage } from "@/lib/telegram"
import { createAuditLog } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { message } = body as { message: string }

    if (!message) {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 })
    }

    const [tokenSetting, chatIdSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "telegram_bot_token" } }),
      prisma.setting.findUnique({ where: { key: "telegram_chat_id" } }),
    ])

    const botToken = tokenSetting?.value
    const chatId = chatIdSetting?.value

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: "Bot Token atau Chat ID belum dikonfigurasi" },
        { status: 400 }
      )
    }

    const result = await sendTelegramMessage(botToken, chatId, message)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    createAuditLog({
      action: "send_telegram",
      userEmail: auth.session?.user?.email || "admin",
      details: `Telegram notification sent`,
    })

    return NextResponse.json({ message: "Pesan Telegram berhasil dikirim" })
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
    return NextResponse.json(
      { error: "Gagal mengirim pesan Telegram" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const [tokenSetting, chatIdSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "telegram_bot_token" } }),
      prisma.setting.findUnique({ where: { key: "telegram_chat_id" } }),
    ])

    const botToken = tokenSetting?.value
    const chatId = chatIdSetting?.value

    if (!botToken || !chatId) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({ configured: true, chatId })
  } catch (error) {
    console.error("Error checking Telegram config:", error)
    return NextResponse.json({ configured: false })
  }
}
