import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rl = await checkRateLimit("quiz:start", 10, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const count = Math.min(parseInt(searchParams.get("count") || "10"), 20)
    const category = searchParams.get("category") || "P3K"

    const questions = await prisma.quizQuestion.findMany({
      where: { isActive: true, category },
      orderBy: { createdAt: "desc" },
    })

    const shuffled = questions.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    const safe = selected.map(({ id, question, optionA, optionB, optionC, optionD, category, difficulty }) => ({
      id,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      category,
      difficulty,
    }))

    return NextResponse.json({ questions: safe, total: selected.length })
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
    return NextResponse.json({ error: "Gagal mengambil soal quiz" }, { status: 500 })
  }
}
