import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
const pdfParse = require("pdf-parse")
import fs from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user?.email ||
      session.user.email !== "f20241022@hyderabad.bits-pilani.ac.in"
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Admin only." },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Extract text from PDF
    const pdfData = await pdfParse(buffer)
    const rawText = pdfData.text

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured in .env" },
        { status: 500 }
      )
    }

    // Split text into chunks (e.g., 150 lines per chunk with 10 lines overlap)
    // The overlap ensures that if a course gets cut across a chunk boundary, 
    // it will still be fully visible in at least one of the chunks.
    const lines = rawText.split('\n')
    const CHUNK_SIZE = 400
    const OVERLAP = 30
    const chunks = []

    for (let i = 0; i < lines.length; i += (CHUNK_SIZE - OVERLAP)) {
      const chunkLines = lines.slice(i, i + CHUNK_SIZE)
      if (chunkLines.join("").trim().length > 0) {
        chunks.push(chunkLines.join('\n'))
      }
    }

    return NextResponse.json({
      success: true,
      chunks: chunks,
      totalChunks: chunks.length,
    })
  } catch (err: any) {
    console.error("ADMIN UPLOAD ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
