import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdmin } from "@/lib/admin-auth"

const ALLOWED_FOLDERS = ["organizations", "articles", "events", "general"]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus gambar" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Maksimal 5MB" }, { status: 400 })
    }

    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "general"
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(filename, file, { access: "public" })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Gagal upload" }, { status: 500 })
  }
}
