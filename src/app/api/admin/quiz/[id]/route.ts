import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { createAuditLog } from "@/lib/audit-log"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { question, optionA, optionB, optionC, optionD, correctAnswer, explanation, category, difficulty, isActive } = body

    if (correctAnswer && !["A", "B", "C", "D"].includes(correctAnswer)) {
      return NextResponse.json({ error: "Jawaban benar harus A, B, C, atau D" }, { status: 400 })
    }

    const q = await prisma.quizQuestion.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(optionA !== undefined && { optionA: optionA.trim() }),
        ...(optionB !== undefined && { optionB: optionB.trim() }),
        ...(optionC !== undefined && { optionC: optionC.trim() }),
        ...(optionD !== undefined && { optionD: optionD.trim() }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation: explanation?.trim() || null }),
        ...(category !== undefined && { category: category.trim() }),
        ...(difficulty !== undefined && { difficulty }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    createAuditLog({
      action: "update_quiz_question",
      userEmail: auth.session?.user?.email || "admin",
      details: `Updated quiz question: "${question?.slice(0, 50) || id}"`,
    })

    return NextResponse.json(q)
  } catch (error) {
    console.error("Error updating quiz question:", error)
    return NextResponse.json({ error: "Gagal mengupdate soal" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    await prisma.quizQuestion.delete({ where: { id } })

    createAuditLog({
      action: "delete_quiz_question",
      userEmail: auth.session?.user?.email || "admin",
      details: `Deleted quiz question: ${id}`,
    })

    return NextResponse.json({ message: "Soal berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting quiz question:", error)
    return NextResponse.json({ error: "Gagal menghapus soal" }, { status: 500 })
  }
}
