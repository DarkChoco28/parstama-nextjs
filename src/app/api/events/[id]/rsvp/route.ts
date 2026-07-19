import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const rl = await checkRateLimit(`rsvp:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." }, { status: 429 })
  }

  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true, title: true } })
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 })

  const body = await request.json()
  const { name, whatsapp, email } = body as { name: string; whatsapp: string; email?: string }

  if (!name?.trim() || !whatsapp?.trim()) {
    return NextResponse.json({ error: "Nama dan WhatsApp wajib diisi" }, { status: 400 })
  }

  const normalizedWa = whatsapp.replace(/\D/g, "")
  if (normalizedWa.length < 10) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid" }, { status: 400 })
  }

  try {
    const rsvp = await prisma.eventRsvp.create({
      data: {
        eventId: id,
        name: name.trim(),
        whatsapp: normalizedWa,
        email: email?.trim() || null,
      },
    })
    return NextResponse.json({ message: `RSVP untuk ${event.title} berhasil!`, rsvp }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Anda sudah melakukan RSVP untuk event ini" }, { status: 400 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const count = await prisma.eventRsvp.count({ where: { eventId: id } })
  return NextResponse.json({ count })
}
