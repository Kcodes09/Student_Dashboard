import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import officialExams from "@/lib/data/exams_normalized.json"
import academicCalendar from "@/lib/data/academic_calendar.json"

import ExamsClient from "./ExamsClient"

type ExamItem = {
  id?: string
  courseCode: string
  courseTitle?: string
  type: string
  date: string // DD/MM
  startTime: string
  endTime: string
}

/* ---------- MIDSEM DATE FROM ACADEMIC CALENDAR ---------- */

function getFirstMidsemDate(calendar: {
  year: number
  days: { date: string; label?: string }[]
}) {
  const midsemDays = calendar.days.filter(
    d => d.label === "MIDSEM"
  )

  if (midsemDays.length === 0) return null

  return new Date(
    Math.min(
      ...midsemDays.map(d =>
        new Date(d.date).getTime()
      )
    )
  )
}

export default async function ExamsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  /* ---------- SELECTED COURSES ---------- */

  const tt = await prisma.timetable.findUnique({
    where: { userEmail: session.user.email },
  })

  const selectedCourses = tt
    ? Object.keys(tt.data as Record<string, any>)
    : []

  /* ---------- USER-ADDED EXAMS ---------- */

  const userExams = await prisma.exam.findMany({
    where: { userEmail: session.user.email },
  })

  const normalizedUser: ExamItem[] = userExams.map(e => ({
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

  const official: ExamItem[] = (officialExams as ExamItem[])
    .filter(e => selectedCourses.includes(e.courseCode))

  /* ---------- MERGE ALL EXAMS ---------- */

  const allExams: ExamItem[] = [
    ...official,
    ...normalizedUser,
  ]

  /* ---------- MIDSEM BOUNDARY ---------- */

  const firstMidsemDate = getFirstMidsemDate(
    academicCalendar
  )

  const toDate = (d: string) => {
    const [day, month] = d.split("/").map(Number)
    return new Date(academicCalendar.year, month - 1, day)
  }

  /* ---------- SPLIT USING CALENDAR ---------- */

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
      ? toDate(e.date) < firstMidsemDate
      : true
  )

  const afterMidsem = evaluations.filter(e =>
    firstMidsemDate
      ? toDate(e.date) >= firstMidsemDate
      : false
  )

  return (
    <>
      <Navbar user={{ email: session.user.email }} />

      <main className="p-4 max-w-4xl mx-auto">
        <h1 className="mb-6 text-xl font-semibold">
          Exams Schedule
        </h1>

        <ExamsClient
          midsems={midsems}
          beforeMidsem={beforeMidsem}
          afterMidsem={afterMidsem}
          endsems={endsems}
        />
      </main>
    </>
  )
}
