import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    if (!code || code.length !== 4) {
      return NextResponse.json({ error: "Invalid share code" }, { status: 400 })
    }

    const draft = await prisma.timetableDraft.findUnique({
      where: { shareCode: code.toUpperCase() },
      select: {
        id: true,
        name: true,
        bitsId: true,
        sections: true,
        updatedAt: true,
      }
    })

    if (!draft) {
      return NextResponse.json({ error: "Timetable not found" }, { status: 404 })
    }

    return NextResponse.json(draft)
  } catch (err) {
    console.error("GET SHARED TT ERROR:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
