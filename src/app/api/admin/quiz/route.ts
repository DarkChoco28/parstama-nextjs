import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category") || ""
    const difficulty = searchParams.get("difficulty") || ""
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (search) where.question = { contains: search, mode: "insensitive" }

    const [questions, total] = await Promise.all([
      prisma.quizQuestion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quizQuestion.count({ where }),
    ])

    return NextResponse.json({
      questions,
      pagination: { page, totalPages: Math.ceil(total / limit), total },
    })
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
    return NextResponse.json({ error: "Gagal mengambil data soal" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { question, optionA, optionB, optionC, optionD, correctAnswer, explanation, category, difficulty } = body

    if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
    }

    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      return NextResponse.json({ error: "Jawaban benar harus A, B, C, atau D" }, { status: 400 })
    }

    const q = await prisma.quizQuestion.create({
      data: {
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        explanation: explanation?.trim() || null,
        category: category?.trim() || "P3K",
        difficulty: difficulty || "sedang",
      },
    })

    createAuditLog({
      action: "create_quiz_question",
      userEmail: auth.session?.user?.email || "admin",
      details: `Created quiz question: "${question.trim().slice(0, 50)}..."`,
    })

    return NextResponse.json(q, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz question:", error)
    return NextResponse.json({ error: "Gagal membuat soal" }, { status: 500 })
  }
}
