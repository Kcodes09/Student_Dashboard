import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseCode, courseTitle, type, date, startTime, endTime } = body

    const [year, month, day] = date.split("-").map(Number)

    const exam = await prisma.exam.create({
      data: {
        courseCode,
        courseTitle,
        type,
        date: new Date(year, month - 1, day),
        startTime,
        endTime,
        userEmail: session.user.email,
      },
    })

    return NextResponse.json(exam)
  } catch (err) {
    console.error("ADD EXAM ERROR:", err)
    return NextResponse.json({ error: "Failed to add exam" }, { status: 500 })
  }
}
