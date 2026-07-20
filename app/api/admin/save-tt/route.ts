import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
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

    const body = await req.json()
    const { timetableData } = body

    if (!timetableData || !Array.isArray(timetableData)) {
      return NextResponse.json(
        { error: "Invalid timetable data provided." },
        { status: 400 }
      )
    }

    // Write to mastertt.json
    const filePath = path.join(process.cwd(), "data", "mastertt.json")
    let existingData: any[] = []
    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      existingData = JSON.parse(fileContent)
    } catch (e) {
      // file might not exist or be empty
    }

    const examsFilePath = path.join(process.cwd(), "lib", "data", "exams_normalized.json")
    let existingExams: any[] = []
    try {
      const examsContent = await fs.readFile(examsFilePath, "utf-8")
      existingExams = JSON.parse(examsContent)
    } catch (e) {
      // file might not exist or be empty
    }

    let updatedCount = 0
    let addedCount = 0
    let updatedExamsCount = 0

    for (const newCourse of timetableData) {
      const extractedExams = newCourse.exams || []
      delete newCourse.exams // keep mastertt.json clean

      for (const exam of extractedExams) {
         const exIdx = existingExams.findIndex(e => e.courseCode === newCourse.courseCode && e.type === exam.type)
         const examEntry = {
            courseCode: newCourse.courseCode,
            courseTitle: newCourse.courseTitle,
            type: exam.type,
            date: exam.date,
            startTime: exam.startTime,
            endTime: exam.endTime
         }
         if (exIdx !== -1) {
            existingExams[exIdx] = examEntry
         } else {
            existingExams.push(examEntry)
         }
         updatedExamsCount++
      }

      const idx = existingData.findIndex(c => c.courseCode === newCourse.courseCode)
      if (idx !== -1) {
        existingData[idx] = newCourse
        updatedCount++
      } else {
        existingData.push(newCourse)
        addedCount++
      }
    }

    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2))
    await fs.writeFile(examsFilePath, JSON.stringify(existingExams, null, 2))

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} and added ${addedCount} courses in mastertt.json, and processed ${updatedExamsCount} exams!`,
    })
  } catch (err: any) {
    console.error("ADMIN SAVE ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
