import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import { NextResponse } from "next/server"
import exams from "@/lib/data/exams_normalized.json"

type Exam = {
  courseCode: string
  courseTitle: string
  type: string
  date: string
  startTime: string
  endTime: string
}

function toDateTime(date: string, time: string) {
  const [day, month] = date.split("/")
  const paddedTime = time.length === 4 ? `0${time}` : time
  return new Date(`2026-${month}-${day}T${paddedTime}`)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 1️⃣ Load saved timetable
    const tt = await prisma.timetable.findUnique({
      where: {
        userEmail: session.user.email,
      },
    })

    const selectedCourses = tt
      ? Object.keys(tt.data as Record<string, any>)
      : []

    // 2️⃣ Filter exams
    const filteredExams = (exams as Exam[])
      .filter(exam =>
        selectedCourses.includes(exam.courseCode)
      )
      .sort((a, b) => {
        const da = toDateTime(a.date, a.startTime).getTime()
        const db = toDateTime(b.date, b.startTime).getTime()
        return da - db
      })

    return NextResponse.json(filteredExams)
  } catch (err) {
    console.error("EXAMS ROUTE ERROR:", err)
    return NextResponse.json(
      { error: "Failed to load exams" },
      { status: 500 }
    )
  }
}
