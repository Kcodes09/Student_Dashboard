import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import officialExams from "@/lib/data/exams_normalized.json"
import academicCalendar from "@/lib/data/academic_calendar.json"

import ExamsClient from "./ExamsClient"

/* ---------------- TYPES ---------------- */

export type ExamItem = {
  id?: string
  courseCode: string
  courseTitle?: string
  type: string
  date: string // DD/MM
  startTime: string
  endTime: string
}

/* ---------------- HELPERS ---------------- */

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

function toDate(exam: ExamItem) {
  const [day, month] = exam.date.split("/").map(Number)
  return new Date(academicCalendar.year, month - 1, day)
}

function getFirstMidsemDate() {
  const midsemDays = academicCalendar.days.filter(
    d => d.label === "MIDSEM"
  )

  if (midsemDays.length === 0) return null

  return new Date(
    Math.min(
      ...midsemDays.map(d => new Date(d.date).getTime())
    )
  )
}

/* ---------------- PAGE ---------------- */

export default async function ExamsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

  /* ---------- TIMETABLE ---------- */

  const tt = await prisma.timetable.findUnique({
    where: { userEmail: email },
  })

  const ttCourses = tt
    ? Object.entries(tt.data as Record<string, any>)
        .filter(
          ([_, v]) =>
            v &&
            typeof v === "object" &&
            Object.keys(v).length > 0
        )
        .map(([code]) => normalizeCourseCode(code))
    : []

  /* ---------- USER EXAMS ---------- */

  const userExamsRaw = await prisma.exam.findMany({
    where: { userEmail: email },
  })

  const userExams: ExamItem[] = userExamsRaw
    .filter(e =>
      ttCourses.includes(
        normalizeCourseCode(e.courseCode)
      )
    )
    .map(e => ({
      id: e.id,
      courseCode: e.courseCode,
      courseTitle: e.courseTitle,
      type: e.type,
      date: `${e.date
        .getDate()
        .toString()
        .padStart(2, "0")}/${(e.date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      startTime: e.startTime,
      endTime: e.endTime,
    }))

  /* ---------- OFFICIAL EXAMS ---------- */

  const officialExamsFiltered: ExamItem[] =
    (officialExams as ExamItem[]).filter(e =>
      ttCourses.includes(
        normalizeCourseCode(e.courseCode)
      )
    )

  /* ---------- MERGE ---------- */

  const allExams: ExamItem[] = [
    ...officialExamsFiltered,
    ...userExams,
  ]

  /* ---------- MIDSEM SPLIT ---------- */

  const firstMidsemDate = getFirstMidsemDate()

  const midsems = allExams.filter(
    e => e.type === "MIDSEM"
  )

  const endsems = allExams.filter(
    e => e.type === "ENDSEM"
  )

  const evaluations = allExams.filter(
    e => e.type !== "MIDSEM" && e.type !== "ENDSEM"
  )

  const beforeMidsem = evaluations.filter(e =>
    firstMidsemDate
      ? toDate(e) < firstMidsemDate
      : true
  )

  const afterMidsem = evaluations.filter(e =>
    firstMidsemDate
      ? toDate(e) >= firstMidsemDate
      : false
  )

  return (
    <>
      <Navbar user={{ email }} />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <h1 className="text-lg sm:text-xl font-semibold mb-5">
          Exams & Evaluations
        </h1>

        {/* CLIENT */}
        <ExamsClient
          beforeMidsem={beforeMidsem}
          midsems={midsems}
          afterMidsem={afterMidsem}
          endsems={endsems}
        />
      </main>
    </>
  )
}
