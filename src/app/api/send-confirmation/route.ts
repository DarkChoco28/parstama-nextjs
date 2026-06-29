import { NextRequest, NextResponse } from "next/server"
import { sendEmail, buildRegistrationConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { fullName, className, major, whatsapp, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
    }

    const { subject, html } = buildRegistrationConfirmationEmail(
      fullName,
      className,
      major,
      whatsapp,
      email,
    )

    await sendEmail({ to: email, subject, html })
    return NextResponse.json({ message: "Email konfirmasi berhasil dikirim" })
  } catch (error: any) {
    console.error("Error kirim email konfirmasi:", error?.message || error)
    return NextResponse.json(
      { error: error?.message || "Gagal mengirim email" },
      { status: 500 }
    )
  }
}
