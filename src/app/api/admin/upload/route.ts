import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus gambar" }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Maksimal 2MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `organizations/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(filename, file, { access: "public" })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Gagal upload" }, { status: 500 })
  }
}
