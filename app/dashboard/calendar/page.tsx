import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import { prisma } from "@/lib/prisma"

import Navbar from "@/app/components/Navbar"
import CalendarGrid from "@/app/components/CalendarGrid"

import calendar from "@/lib/data/academic_calendar.json"
import officialExams from "@/lib/data/exams_normalized.json"
import masterTT from "@/data/mastertt.json"

import { generateStudentTT } from "@/app/lib/timetable/generateStudentTT"
import type {
  Session as CalendarSession,
  WeekDay,
  Exam,
} from "@/types/timetable"

type SelectedSections = {
  [courseCode: string]: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
}

/* -------- helpers (ADDITIVE) -------- */

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  /* -------- TIMETABLE -------- */

  const tt = await prisma.timetable.findUnique({
    where: { userEmail: session.user.email },
  })

  const selectedSections =
    (tt?.data as SelectedSections) ?? {}

  /* -------- CLEAN + NORMALIZE COURSES -------- */

  const selectedCourses = Object.entries(selectedSections)
    .filter(
      ([_, v]) =>
        v &&
        typeof v === "object" &&
        Object.keys(v).length > 0
    )
    .map(([code]) => normalizeCourseCode(code))

  /* -------- CLASSES (UNCHANGED LOGIC) -------- */

  const rawSessions = generateStudentTT(
    masterTT,
    selectedSections
  )

  const sessions: CalendarSession[] = rawSessions.map(
    s => ({
      ...s,
      day: s.day as WeekDay,
      courseCode: normalizeCourseCode(s.courseCode),
    })
  )

  /* -------- OFFICIAL EXAMS -------- */

  const official: Exam[] = (officialExams as any[])
    .filter(e =>
      selectedCourses.includes(
        normalizeCourseCode(e.courseCode)
      )
    )
    .map(e => ({
      courseCode: normalizeCourseCode(e.courseCode),
      date: `2026-${e.date
        .split("/")
        .reverse()
        .join("-")}`,
      startTime: e.startTime,
      endTime: e.endTime,
    }))

  /* -------- USER EXAMS -------- */

  const userExamsRaw = await prisma.exam.findMany({
    where: { userEmail: session.user.email },
  })

  const user: Exam[] = userExamsRaw
    .filter(e =>
      selectedCourses.includes(
        normalizeCourseCode(e.courseCode)
      )
    )
    .map(e => ({
      courseCode: normalizeCourseCode(e.courseCode),
      date: e.date.toISOString().slice(0, 10),
      startTime: e.startTime,
      endTime: e.endTime,
    }))

  const examList: Exam[] = [...official, ...user]

  return (
    <>
      <Navbar user={{ email: session.user.email }} />
      <CalendarGrid
        sessions={sessions}
        exams={examList}
        calendar={calendar}
        initialYear={calendar.year}
        initialMonth={3}
      />
    </>
  )
}
