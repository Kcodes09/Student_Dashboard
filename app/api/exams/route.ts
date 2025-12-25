import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"
import exams from "../../../lib/data/exams_normalized.json"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json([])
  }

  const ttPath = path.join(
    process.cwd(),
    "data",
    "timetables",
    `${session.user.id}.json`
  )

  if (!fs.existsSync(ttPath)) {
    return NextResponse.json([])
  }

  const savedTT: Record<string, any> = JSON.parse(
    fs.readFileSync(ttPath, "utf-8")
  )

  // courses user has selected in timetable
  const activeCourses = new Set(Object.keys(savedTT))

  // filter normalized exams
  const userExams = exams.filter(exam =>
    activeCourses.has(exam.courseCode)
  )

  return NextResponse.json(userExams)
}
