import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { NextResponse } from "next/server"

// DELETE /api/timetable/drafts/[id] — delete a specific draft
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only delete if it belongs to this user
    const existing = await prisma.timetableDraft.findFirst({
      where: { id, userEmail: session.user.email },
    })

    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    await prisma.timetableDraft.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE DRAFT ERROR:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
