import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({
        error: "Gmail belum dikonfigurasi",
        hasUser: !!process.env.GMAIL_USER,
        hasPass: !!process.env.GMAIL_APP_PASSWORD,
      })
    }

    const to = request.nextUrl.searchParams.get("to") || "zyzpy27@gmail.com"

    await sendEmail({
      to,
      subject: "Test Notifikasi PMR PARSTAMA",
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2 style="color:#DC2626">PMR PARSTAMA</h2>
          <p>Email test berhasil dari Vercel!</p>
          <p style="color:#666;font-size:12px">Waktu: ${new Date().toLocaleString("id-ID")}</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Email terkirim ke ${to}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || "Gagal mengirim",
      stack: error?.stack,
    }, { status: 500 })
  }
}
