import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import academicCalendar from "@/lib/data/academic_calendar.json"
import masterTT from "@/data/mastertt.json"

import { generateStudentTT } from "@/app/lib/timetable/generateStudentTT"
import { computeTotalClassesForCourse } from "@/lib/attendance/computeTotalClasses"

import type { Session, WeekDay } from "@/types/timetable"

/* ---------------- HELPERS ---------------- */

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

/* ---------------- PAGE ---------------- */

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

  /* ---------- TIMETABLE ---------- */

  const tt = await prisma.timetable.findUnique({
    where: { userEmail: email },
  })

  const selectedSections =
    (tt?.data as Record<string, any>) ?? {}

  const rawSessions = generateStudentTT(
    masterTT,
    selectedSections
  )

  const sessions: Session[] = rawSessions.map(s => ({
    ...s,
    courseCode: normalizeCourseCode(s.courseCode),
    day: s.day as WeekDay,
  }))

  const courseCodes = Array.from(
    new Set(sessions.map(s => s.courseCode))
  )

  /* ---------- ATTENDANCE ---------- */

  const attendance = await prisma.attendance.findMany({
    where: { userEmail: email },
  })

  return (
    <>
      <Navbar user={{ email }} />

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        <h1 className="text-lg sm:text-xl font-semibold">
          Attendance
        </h1>

        {courseCodes.map(code => {
          const total = computeTotalClassesForCourse({
            courseCode: code,
            sessions,
            calendar: academicCalendar.days,
          })

          const attended = attendance.filter(
            a => normalizeCourseCode(a.courseCode) === code
          ).length

          const percent =
            total === 0
              ? 0
              : Math.round((attended / total) * 100)

          return (
            <div
              key={code}
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="font-medium">{code}</div>
              <div className="text-sm text-[var(--text-muted)]">
                {attended} / {total} classes attended
              </div>
              <div className="mt-1 text-sm">
                Attendance:{" "}
                <span className="font-medium">
                  {percent}%
                </span>
              </div>
            </div>
          )
        })}
      </main>
    </>
  )
}
