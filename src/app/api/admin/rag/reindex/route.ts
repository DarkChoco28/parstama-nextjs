import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { rebuildIndex } from "@/lib/rag-indexer"

export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const result = await rebuildIndex()
    return NextResponse.json({
      success: true,
      message: `Reindex selesai. ${result.totalChunks} chunks di-index.`,
      result,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("RAG reindex error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
