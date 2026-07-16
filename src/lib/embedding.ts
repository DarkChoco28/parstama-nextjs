import { GoogleGenerativeAI } from "@google/generative-ai"
import { PrismaClient } from "@prisma/client"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")
const EMBEDDING_MODEL = "text-embedding-004"

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent(text)
  return result.embedding.values
}

export function chunkText(text: string, maxChars: number = 800, overlap: number = 100): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= maxChars) return [cleaned]

  const chunks: string[] = []
  let start = 0

  while (start < cleaned.length) {
    let end = start + maxChars
    if (end < cleaned.length) {
      const lastPeriod = cleaned.lastIndexOf(".", end)
      const lastSpace = cleaned.lastIndexOf(" ", end)
      if (lastPeriod > start + maxChars * 0.5) end = lastPeriod + 1
      else if (lastSpace > start + maxChars * 0.5) end = lastSpace + 1
    }
    chunks.push(cleaned.slice(start, end).trim())
    start = end - overlap
  }

  return chunks.filter(c => c.length > 20)
}

export interface SearchResult {
  id: string
  content: string
  category: string
  source: string | null
  similarity: number
}

export async function findRelevantChunks(
  query: string,
  topK: number = 10,
  prisma: PrismaClient
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)
  const embeddingStr = `[${queryEmbedding.join(",")}]`

  const results = await prisma.$queryRawUnsafe<SearchResult[]>(
    `SELECT id, content, category, source,
      1 - (embedding <=> $1::vector) AS similarity
     FROM "KnowledgeEmbedding"
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    embeddingStr,
    topK
  )

  return results.filter(r => r.similarity > 0.3)
}
