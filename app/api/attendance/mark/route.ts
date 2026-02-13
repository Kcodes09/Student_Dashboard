import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { courseCode, date } = await req.json()

  try {
    await prisma.attendance.create({
      data: {
        userEmail: session.user.email,
        courseCode,
        date: new Date(date),
      },
    })
    prisma.account.fields.

    return NextResponse.json({ ok: true })
  } catch (e) {
    // Duplicate = already marked
    return NextResponse.json({ ok: false })
  }
}

