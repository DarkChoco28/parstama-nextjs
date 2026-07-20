export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    })

    const data = await res.json()

    if (!data.ok) {
      return { ok: false, error: data.description || "Gagal mengirim pesan Telegram" }
    }

    return { ok: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal mengirim pesan Telegram"
    return { ok: false, error: msg }
  }
}

export function buildRegistrationTelegram(
  fullName: string,
  className: string,
  major: string,
  whatsapp: string,
  email?: string | null
): string {
  return (
    `*Pendaftar Baru PMR PARSTAMA*\n\n` +
    `*Nama:* ${fullName}\n` +
    `*Kelas:* ${className} - ${major}\n` +
    `*WhatsApp:* ${whatsapp}\n` +
    `*Email:* ${email || "-"}\n` +
    `*Status:* Pending\n\n` +
    `Silakan cek dashboard admin untuk detail.`
  )
}

export function buildCommentTelegram(
  commenterName: string,
  articleTitle: string,
  content: string
): string {
  const truncated = content.length > 100 ? content.slice(0, 100) + "..." : content
  return (
    `*Komentar Baru di Blog*\n\n` +
    `*Oleh:* ${commenterName}\n` +
    `*Artikel:* ${articleTitle}\n` +
    `*Isi:* ${truncated}`
  )
}

export function buildEventTelegram(
  eventTitle: string,
  startDate: string,
  location?: string | null
): string {
  return (
    `*Event Baru*\n\n` +
    `*Judul:* ${eventTitle}\n` +
    `*Tanggal:* ${startDate}\n` +
    `*Lokasi:* ${location || "-"}`
  )
}
