import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()

    await prisma.timetable.upsert({
      where: {
        userEmail: session.user.email,
      },
      update: {
        data,
      },
      create: {
        userEmail: session.user.email,
        data,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("SAVE TT ERROR:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
