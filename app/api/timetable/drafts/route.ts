import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { NextResponse } from "next/server"

// GET /api/timetable/drafts — return all drafts for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json([], { status: 401 })
    }

    const drafts = await prisma.timetableDraft.findMany({
      where: { userEmail: session.user.email },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(drafts)
  } catch (err) {
    console.error("GET DRAFTS ERROR:", err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST /api/timetable/drafts — upsert a single draft
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, bitsId, isActive, sections } = body

    if (!id || !name || !bitsId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If this draft is being set active, deactivate all others first
    if (isActive) {
      await prisma.timetableDraft.updateMany({
        where: { userEmail: session.user.email, isActive: true },
        data: { isActive: false },
      })
    }

    const draft = await prisma.timetableDraft.upsert({
      where: { id },
      update: { name, bitsId, isActive: isActive ?? false, sections: sections ?? {} },
      create: {
        id,
        name,
        bitsId,
        isActive: isActive ?? false,
        sections: sections ?? {},
        userEmail: session.user.email,
      },
    })

    return NextResponse.json(draft)
  } catch (err) {
    console.error("POST DRAFT ERROR:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
