import { NextResponse } from "next/server"
import { rebuildIndex } from "@/lib/rag-indexer"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await rebuildIndex()
    console.log(`[CRON] RAG reindex done: ${result.totalChunks} chunks`)
    return NextResponse.json({ success: true, result })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[CRON] RAG reindex failed:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
