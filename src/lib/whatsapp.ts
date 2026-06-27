interface SendWhatsAppOptions {
  target: string
  message: string
}

export async function sendWhatsApp({ target, message }: SendWhatsAppOptions) {
  const token = process.env.FONNTE_TOKEN
  if (!token) {
    throw new Error("Fonnte token belum dikonfigurasi")
  }

  const cleanNumber = target.replace(/[^0-9]/g, "")

  const formData = new FormData()
  formData.append("target", cleanNumber)
  formData.append("message", message)
  formData.append("countryCode", "62")
  formData.append("typing", "true")
  formData.append("delay", "2")

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: formData,
  })

  const data = await res.json()

  if (!data.status || data.status !== true) {
    throw new Error(data.message || data.reason || "Gagal mengirim WhatsApp")
  }

  return data
}

export function buildStatusWhatsApp(
  fullName: string,
  className: string,
  major: string,
  whatsapp: string,
  email: string,
  status: "accepted" | "rejected" | "pending"
) {
  const statusText = status === "accepted" ? "DITERIMA" : status === "rejected" ? "DITOLAK" : "MENUNGGU"
  const emoji = status === "accepted" ? "✅" : status === "rejected" ? "❌" : "⏳"

  const baseMessage =
    `Assalamu'alaikum Wr. Wb.\n\n` +
    `Halo *${fullName}* 👋\n\n` +
    `Kami dari PARSTAMA SMKN ingin memberitahukan bahwa pendaftaran Anda telah :\n\n` +
    `*${emoji} Status: ${statusText}*\n\n`

  const extraMessage =
    status === "accepted"
      ? `Selamat! Anda telah *DITERIMA* sebagai anggota PARSTAMA. 🎉\n` +
        `Silakan hubungi admin untuk informasi lebih lanjut.\n\n`
      : status === "rejected"
      ? `Mohon maaf, pendaftaran Anda belum dapat diterima saat ini.\n` +
        `Anda tetap dapat mendaftar kembali di masa mendatang.\n\n`
      : `Status pendaftaran Anda sedang dalam proses verifikasi.\n\n`

  const dataSection =
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Data Pendaftaran*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `👤 Nama: ${fullName}\n` +
    `🏫 Kelas: ${className} - ${major}\n` +
    `📱 WhatsApp: ${whatsapp}\n` +
    `📧 Email: ${email || "-"}\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n`

  const footer =
    `Jika ada pertanyaan, silakan hubungi admin:\n` +
    `📞 0814-5914-5800\n\n` +
    `Hormat kami,\n` +
    `Admin PARSTAMA 🏥`

  return baseMessage + extraMessage + dataSection + footer
}
