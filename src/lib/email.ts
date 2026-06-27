import nodemailer from "nodemailer"

export function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  })
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.BREVO_LOGIN || !process.env.BREVO_SMTP_KEY) {
    throw new Error("Brevo SMTP credentials belum dikonfigurasi")
  }

  const transporter = createTransporter()
  const result = await transporter.sendMail({
    from: `"PMR PARSTAMA" <${process.env.BREVO_LOGIN}>`,
    to,
    subject,
    html,
  })

  return result
}

export function buildStatusEmail(
  fullName: string,
  className: string,
  major: string,
  whatsapp: string,
  email: string,
  status: "accepted" | "rejected" | "pending"
) {
  const statusText = status === "accepted" ? "DITERIMA" : status === "rejected" ? "DITOLAK" : "MENUNGGU"
  const statusColor = status === "accepted" ? "#34D399" : status === "rejected" ? "#EF4444" : "#FCD34D"

  const subject = `Status Pendaftaran PMR PARSTAMA - ${statusText}`

  const extraMessage =
    status === "accepted"
      ? `<p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
          Selamat! Anda telah <strong style="color:#34D399">DITERIMA</strong> sebagai anggota PMR PARSTAMA. Silakan hubungi admin untuk informasi lebih lanjut.
        </p>`
      : status === "rejected"
      ? `<p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
          Mohon maaf, pendaftaran Anda belum dapat diterima saat ini. Anda tetap dapat mendaftar kembali di masa mendatang.
        </p>`
      : `<p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
          Status pendaftaran Anda sedang dalam proses verifikasi.
        </p>`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0A0A0B;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <div style="background:rgba(20,20,22,.9);border-radius:16px;border:1px solid rgba(220,38,38,.2);overflow:hidden">
          <div style="background:linear-gradient(135deg,#DC2626,#EF4444);padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">PMR PARSTAMA</h1>
            <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:13px">SMKN - Status Pendaftaran</p>
          </div>
          <div style="padding:24px">
            <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 16px">
              Assalamu'alaikum Wr. Wb.
            </p>
            <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
              Halo <strong style="color:#fff">${fullName}</strong>,
            </p>
            <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
              Status pendaftaran Anda di PMR PARSTAMA adalah:
            </p>
            <div style="text-align:center;margin:20px 0">
              <span style="display:inline-block;padding:12px 32px;background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor}50;border-radius:8px;font-size:16px;font-weight:700">
                ${statusText}
              </span>
            </div>
            ${extraMessage}
            <div style="background:rgba(255,255,255,.03);border-radius:12px;padding:16px;margin:20px 0;border:1px solid rgba(255,255,255,.06)">
              <p style="color:rgba(255,255,255,.4);font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Data Pendaftaran</p>
              <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Nama:</strong> ${fullName}</p>
              <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Kelas:</strong> ${className} - ${major}</p>
              <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">WhatsApp:</strong> ${whatsapp}</p>
              <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Email:</strong> ${email}</p>
            </div>
            <p style="color:rgba(255,255,255,.5);font-size:12px;margin:20px 0 0;line-height:1.6">
              Jika ada pertanyaan, silakan hubungi admin via WhatsApp di <a href="https://wa.me/6281932781179" style="color:#DC2626;text-decoration:none">0819-3278-1179</a>.
            </p>
            <p style="color:rgba(255,255,255,.3);font-size:11px;margin:24px 0 0;text-align:center">
              Hormat kami,<br>Admin PMR PARSTAMA
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
