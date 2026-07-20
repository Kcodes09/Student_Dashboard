import Navbar from "@/app/components/Navbar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import academicCalendar from "@/lib/data/academic_calendar.json"
import masterTT from "@/data/mastertt.json"

import { generateStudentTT } from "@/app/lib/timetable/generateStudentTT"
import { computeTotalClassesForCourse, getWeekDayFromDate } from "@/lib/attendance/computeTotalClasses"
import { getCachedTimetable, getCachedAttendance } from "@/lib/cachedData"

import type { Session, WeekDay } from "@/types/timetable"

export const revalidate = 30

/* ---------------- HELPERS ---------------- */

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

function getAttendanceColor(percent: number): { bar: string; text: string; bg: string } {
  if (percent >= 75)
    return {
      bar: "linear-gradient(90deg, #10b981, #34d399)",
      text: "rgb(5,150,105)",
      bg: "rgba(16,185,129,0.08)",
    }
  if (percent >= 65)
    return {
      bar: "linear-gradient(90deg, #f59e0b, #fbbf24)",
      text: "rgb(217,119,6)",
      bg: "rgba(245,158,11,0.08)",
    }
  return {
    bar: "linear-gradient(90deg, #ef4444, #f87171)",
    text: "rgb(220,38,38)",
    bg: "rgba(239,68,68,0.08)",
  }
}

/* ---------------- PAGE ---------------- */

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

  /* ---------- TIMETABLE ---------- */

  const tt = await getCachedTimetable(email)

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

  const attendance = await getCachedAttendance(email)

  /* ---------- COMPUTE SUMMARY ---------- */

  const courseStats = courseCodes.map(code => {
    const totals = computeTotalClassesForCourse({
      courseCode: code,
      sessions,
      calendar: academicCalendar.days,
    })

    const courseAttendance = attendance.filter(
      a => normalizeCourseCode(a.courseCode) === code
    )

    let attL = 0, attT = 0, attP = 0

    for (const a of courseAttendance) {
      const d = new Date(a.date)
      const weekday = getWeekDayFromDate(d)
      if (!weekday) continue

      const daySessions = sessions.filter(
        s => s.courseCode === code && s.day === weekday
      )
      const typesOnDay = new Set(daySessions.map(s => s.type?.toUpperCase()))
      
      if (typesOnDay.has("LECTURE")) attL++
      if (typesOnDay.has("TUTORIAL")) attT++
      if (typesOnDay.has("PRACTICAL")) attP++
    }

    const attended = attL + attT + attP
    const total = totals.overall
    const percent =
      total === 0 ? 0 : Math.round((attended / total) * 100)

    return { 
      code, 
      attended, 
      total, 
      percent,
      L: { attended: attL, total: totals.totalL },
      T: { attended: attT, total: totals.totalT },
      P: { attended: attP, total: totals.totalP }
    }
  })

  const overallPercent =
    courseStats.length === 0
      ? 0
      : Math.round(
          courseStats.reduce((acc, c) => acc + c.percent, 0) / courseStats.length
        )

  const overallColors = getAttendanceColor(overallPercent)

  return (
    <>
      <Navbar user={session.user} />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Attendance
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Your course-wise attendance overview
            </p>
          </div>

          {/* Overall summary pill */}
          {courseStats.length > 0 && (
            <div
              id="tour-attendance-summary"
              className="flex items-center gap-3 rounded-2xl px-5 py-3 border"
              style={{
                backgroundColor: overallColors.bg,
                borderColor: overallColors.text,
              }}
            >
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Overall Average
                </div>
                <div
                  className="text-2xl font-bold leading-none mt-0.5"
                  style={{ color: overallColors.text }}
                >
                  {overallPercent}%
                </div>
              </div>
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
              >
                {overallPercent >= 75 ? "✅" : overallPercent >= 65 ? "⚠️" : "❌"}
              </div>
            </div>
          )}
        </div>

        {/* Course cards */}
        {courseStats.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium">No courses found</p>
            <p className="text-sm mt-1 opacity-75">Set up your timetable to track attendance</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courseStats.map(({ code, attended, total, percent, L, T, P }) => {
              const colors = getAttendanceColor(percent)
              return (
                <div
                  key={code}
                  className="rounded-2xl p-5 border"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Course header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div
                        className="font-bold text-base tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {code}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {attended} of {total} classes attended
                      </div>
                    </div>
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: colors.text }}
                    >
                      {percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{
                      height: "8px",
                      backgroundColor: "var(--bg-muted)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        background: colors.bar,
                      }}
                    />
                  </div>

                  {/* Status label */}
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: colors.text }}
                      />
                      <span className="text-xs font-medium" style={{ color: colors.text }}>
                        {percent >= 75
                          ? "Good standing"
                          : percent >= 65
                          ? "Needs improvement"
                          : "Below minimum — at risk"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-[10px] font-bold">
                      {L.total > 0 && (
                        <div className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                          Lec: {L.attended}/{L.total} <span className="opacity-70 ml-0.5">({Math.round((L.attended/L.total)*100)}%)</span>
                        </div>
                      )}
                      {T.total > 0 && (
                        <div className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                          Tut: {T.attended}/{T.total} <span className="opacity-70 ml-0.5">({Math.round((T.attended/T.total)*100)}%)</span>
                        </div>
                      )}
                      {P.total > 0 && (
                        <div className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}>
                          Lab: {P.attended}/{P.total} <span className="opacity-70 ml-0.5">({Math.round((P.attended/P.total)*100)}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
