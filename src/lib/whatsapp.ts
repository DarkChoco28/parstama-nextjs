export function buildStatusWhatsApp(
  fullName: string,
  className: string,
  major: string,
  whatsapp: string,
  email: string,
  status: "accepted" | "rejected" | "pending"
) {
  const statusText = status === "accepted" ? "DITERIMA" : status === "rejected" ? "DITOLAK" : "MENUNGGU"

  const baseMessage =
    `Halo ${fullName}\n\n` +
    `Kami dari PMR WIRA SMKN 1 SINGOSARI ingin memberitahukan bahwa pendaftaran Anda telah :\n\n` +
    `*Status: ${statusText}*\n\n`

  const extraMessage =
    status === "accepted"
      ? `Selamat! Anda telah *DITERIMA* sebagai anggota PARSTAMA.\n` +
        `Silakan hubungi admin untuk informasi lebih lanjut.\n\n`
      : status === "rejected"
      ? `Mohon maaf, pendaftaran Anda belum dapat diterima saat ini.\n` +
        `Anda tetap dapat mendaftar kembali di masa mendatang.\n\n`
      : `Status pendaftaran Anda sedang dalam proses verifikasi.\n\n`

  const groupLink =
    status === "accepted"
      ? `Bergabunglah ke grup WhatsApp anggota baru:\nhttps://chat.whatsapp.com/FnbPOSQDUvM8t3MXrxT7Wv\n\n`
      : ""

  const dataSection =
    `Data Pendaftaran\n` +
    `Nama: ${fullName}\n` +
    `Kelas: ${className} - ${major}\n` +
    `WhatsApp: ${whatsapp}\n` +
    `Email: ${email || "-"}\n\n`

  const footer =
    `Jika ada pertanyaan, silakan hubungi humas:\n` +
    `0814-5914-5800 (Mas Dafiq)\n` +
    `0838-2379-7912 (Mbak Fiona)\n\n` +
    `Hormat kami,\n` +
    `Bot Admin PARSTAMA`

  return baseMessage + extraMessage + groupLink + dataSection + footer
}
