export const dynamic = "force-dynamic"

import Navbar from "@/app/components/Navbar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import officialExams from "@/lib/data/exams_normalized.json"
import academicCalendar from "@/lib/data/academic_calendar.json"
import { getCachedTimetable, getCachedExams } from "@/lib/cachedData"

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
  return new Date(Date.UTC(academicCalendar.year, month - 1, day))
}

function getFirstMidsemDate() {
  const midsemDays = academicCalendar.days.filter(
    d => d.label.toLowerCase().includes("mid-semester")
  )

  if (midsemDays.length === 0) return null

  return new Date(
    Math.min(
      ...midsemDays.map(d => {
        const [y, m, day] = d.date.split("-").map(Number)
        return Date.UTC(y, m - 1, day)
      })
    )
  )
}

function getCalendarDates() {
  const midsemDays = academicCalendar.days.filter(
    d => d.label.toLowerCase().includes("mid-semester examinations") && d.date.startsWith("2026")
  ).map(d => {
    const [y, m, day] = d.date.split("-")
    return `${day}/${m}`
  })

  // Compre ranges from begin to end
  const compreBegin = academicCalendar.days.find(d => d.label.toLowerCase().includes("comprehensive examinations begin") && d.date.startsWith("2026"))
  const compreEnd = academicCalendar.days.find(d => d.label.toLowerCase().includes("comprehensive examinations end") && d.date.startsWith("2026"))
  
  const compreDays: string[] = []
  if (compreBegin && compreEnd) {
    let current = new Date(compreBegin.date)
    const end = new Date(compreEnd.date)
    while (current <= end) {
      const day = current.getDate().toString().padStart(2, "0")
      const month = (current.getMonth() + 1).toString().padStart(2, "0")
      compreDays.push(`${day}/${month}`)
      current.setDate(current.getDate() + 1)
    }
  }

  return { midsemDays, compreDays }
}

/* ---------------- PAGE ---------------- */

export default async function ExamsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

  /* ---------- TIMETABLE ---------- */

  const tt = await getCachedTimetable(email)

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

  const userExamsRaw = await getCachedExams(email)

  const userExams: ExamItem[] = userExamsRaw
    .map(e => {
      const d = new Date(e.date)
      return {
        id: e.id,
        courseCode: e.courseCode,
        courseTitle: e.courseTitle,
        type: e.type,
        date: `${d
          .getUTCDate()
          .toString()
          .padStart(2, "0")}/${(d.getUTCMonth() + 1)
          .toString()
          .padStart(2, "0")}`,
        startTime: e.startTime,
        endTime: e.endTime,
      }
    })

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

  const { midsemDays: midsemCalendarDates, compreDays: compreCalendarDates } = getCalendarDates()

  return (
    <>
      <Navbar user={session.user} />

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
          midsemCalendarDates={midsemCalendarDates}
          compreCalendarDates={compreCalendarDates}
        />
      </main>
    </>
  )
}
