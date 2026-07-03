import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "Resend API belum dikonfigurasi",
        hasApiKey: !!process.env.RESEND_API_KEY,
      })
    }

    const to = request.nextUrl.searchParams.get("to") || "zyzpy27@gmail.com"

    await sendEmail({
      to,
      subject: "Test Notifikasi PARSTAMA",
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2 style="color:#DC2626">PARSTAMA</h2>
          <p>Email test berhasil dari Vercel via Resend!</p>
          <p style="color:#666;font-size:12px">Waktu: ${new Date().toLocaleString("id-ID")}</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Email terkirim ke ${to}`,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Gagal mengirim email" }, { status: 500 })
  }
}
