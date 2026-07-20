import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rl = await checkRateLimit("quiz:submit", 10, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { answers } = body as { answers: { questionId: string; answer: string }[] }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Jawaban wajib diisi" }, { status: 400 })
    }

    const questionIds = answers.map(a => a.questionId)
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
    })

    const questionMap = new Map(questions.map(q => [q.id, q]))

    let correct = 0
    const results = answers.map(a => {
      const q = questionMap.get(a.questionId)
      const isCorrect = q?.correctAnswer === a.answer
      if (isCorrect) correct++
      return {
        questionId: a.questionId,
        answer: a.answer,
        correctAnswer: q?.correctAnswer || "",
        isCorrect,
        explanation: q?.explanation || null,
      }
    })

    const score = Math.round((correct / answers.length) * 100)

    return NextResponse.json({
      score,
      correct,
      total: answers.length,
      results,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Gagal submit jawaban" }, { status: 500 })
  }
}
