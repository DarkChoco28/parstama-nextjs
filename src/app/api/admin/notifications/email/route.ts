import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const body = await request.json()
    const { registrationId, type } = body

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID wajib diisi" }, { status: 400 })
    }

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
    })

    if (!reg) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 })
    }

    if (!reg.email) {
      return NextResponse.json({ error: "Pendaftar tidak memiliki email" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Resend API key belum dikonfigurasi" }, { status: 500 })
    }

    let subject = ""
    let htmlContent = ""

    if (type === "status_update") {
      const statusText = reg.status === "accepted" ? "DITERIMA" : reg.status === "rejected" ? "DITOLAK" : "MENUNGGU"
      const statusColor = reg.status === "accepted" ? "#34D399" : reg.status === "rejected" ? "#EF4444" : "#FCD34D"

      subject = `Status Pendaftaran PMR PARSTAMA - ${statusText}`
      htmlContent = `
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
                  Assalamu'alaikum Wr. Wb. 🙏
                </p>
                <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
                  Halo <strong style="color:#fff">${reg.fullName}</strong>,
                </p>
                <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
                  Status pendaftaran Anda di PMR PARSTAMA adalah:
                </p>
                <div style="text-align:center;margin:20px 0">
                  <span style="display:inline-block;padding:12px 32px;background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor}50;border-radius:8px;font-size:16px;font-weight:700">
                    ${statusText}
                  </span>
                </div>
                <div style="background:rgba(255,255,255,.03);border-radius:12px;padding:16px;margin:20px 0;border:1px solid rgba(255,255,255,.06)">
                  <p style="color:rgba(255,255,255,.4);font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Data Pendaftaran</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Nama:</strong> ${reg.fullName}</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Kelas:</strong> ${reg.class} - ${reg.major}</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">WhatsApp:</strong> ${reg.whatsapp}</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Email:</strong> ${reg.email}</p>
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
    } else {
      subject = "Konfirmasi Pendaftaran PMR PARSTAMA"
      htmlContent = `
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
                <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:13px">Konfirmasi Pendaftaran</p>
              </div>
              <div style="padding:24px">
                <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 16px">
                  Assalamu'alaikum Wr. Wb. 🙏
                </p>
                <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
                  Halo <strong style="color:#fff">${reg.fullName}</strong>,
                </p>
                <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 20px">
                  Terima kasih telah mendaftar sebagai anggota PMR PARSTAMA. Berikut data pendaftaran Anda:
                </p>
                <div style="background:rgba(255,255,255,.03);border-radius:12px;padding:16px;margin:20px 0;border:1px solid rgba(255,255,255,.06)">
                  <p style="color:rgba(255,255,255,.4);font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Data Pendaftaran</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Nama:</strong> ${reg.fullName}</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Kelas:</strong> ${reg.class} - ${reg.major}</p>
                  <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0"><strong style="color:#fff">Status:</strong> Menunggu</p>
                </div>
                <p style="color:rgba(255,255,255,.5);font-size:12px;margin:20px 0 0;line-height:1.6">
                  Pendaftaran Anda sedang dalam proses verifikasi. Kami akan menginformasikan hasilnya segera.
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
    }

    await resend.emails.send({
      from: "PMR PARSTAMA <onboarding@resend.dev>",
      to: reg.email,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({ message: "Email berhasil dikirim" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim email" },
      { status: 500 }
    )
  }
}
