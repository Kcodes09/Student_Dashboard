import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({})
    }

    const tt = await prisma.timetable.findUnique({
      where: {
        userEmail: session.user.email,
      },
    })

    return NextResponse.json(tt?.data ?? {})
  } catch (err) {
    console.error("LOAD TT ERROR:", err)
    return NextResponse.json(
      { error: "Failed to load timetable" },
      { status: 500 }
    )
  }
}
