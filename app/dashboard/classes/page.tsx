import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import academicCalendar from "@/lib/data/academic_calendar.json"
import masterTT from "@/data/mastertt.json"

import { generateStudentTT } from "@/app/lib/timetable/generateStudentTT"
import type { Session, WeekDay } from "@/types/timetable"

import TodayClassesList from "./today-classes-list"
import { stringify } from "querystring"

/* ---------------- HELPERS ---------------- */

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

function getClassworkBeginsDate(): Date | null {
  const day = academicCalendar.days.find(d =>
    d.label?.toLowerCase().includes("classwork")
  )
  return day ? new Date(day.date) : null
}

function getWeekDayFromDate(date: Date): WeekDay | null {
  const map: Record<number, WeekDay> = {
    1: "M",
    2: "T",
    3: "W",
    4: "Th",
    5: "F",
    6: "S",
  }
  return map[date.getDay()] ?? null
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}
export async function NextClass(){
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

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
    
    const realToday = new Date()
    

    const realTime= realToday.getTime()
    const Time=String(realTime)
    
    const academicToday = new Date(
    academicCalendar.year,
    realToday.getMonth(),
    realToday.getDate()
  )

  const academicISO = academicToday
    .toISOString()
    .slice(0, 10)

  const todayMeta = academicCalendar.days.find(
    d => d.date === academicISO
  )

  const weekday = getWeekDayFromDate(academicToday)
  const todayClasses =
    weekday === null
      ? []
      : sessions
          .filter(s => s.day === weekday)
          .sort(
            (a, b) =>
              toMinutes(a.startTime) -
              toMinutes(b.startTime)
          )
  console.log(Number(sessions[1].endTime))
  if (realTime > Number(sessions[-1].endTime)){
    realToday.setDate(realToday.getDate() + 1)
    
  }
  else
  return{
    
  }
}
NextClass()

/* ---------------- PAGE ---------------- */

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const email = session.user.email

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

  const classworkBegins = getClassworkBeginsDate()
  const realToday = new Date()

  const academicToday = new Date(
    academicCalendar.year,
    realToday.getMonth(),
    realToday.getDate()
  )

  const academicISO = academicToday
    .toISOString()
    .slice(0, 10)

  const todayMeta = academicCalendar.days.find(
    d => d.date === academicISO
  )

  const weekday = getWeekDayFromDate(academicToday)

  const todayClasses =
    weekday === null
      ? []
      : sessions
          .filter(s => s.day === weekday)
          .sort(
            (a, b) =>
              toMinutes(a.startTime) -
              toMinutes(b.startTime)
          )

  const classesStarted =
    classworkBegins !== null &&
    realToday >= classworkBegins

  return (
    <>
      <Navbar user={{ email }} />

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <section
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h1 className="text-lg sm:text-xl font-semibold mb-3">
            Classes
          </h1>

          {!classesStarted && classworkBegins && (
            <p className="text-sm text-[var(--text-muted)]">
              Your classes begin on{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {classworkBegins.toDateString()}
              </span>
            </p>
          )}

          {classesStarted && (
            <>
              <h2 className="text-base sm:text-lg font-semibold mb-3">
                Today’s Classes
              </h2>

              {realToday.getDay() === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No classes on Sundays.
                </p>
              ) : todayMeta?.holiday ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No classes today ({todayMeta.label}).
                </p>
              ) : todayClasses.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No classes scheduled for today.
                </p>
              ) : (
                <TodayClassesList
                  classes={todayClasses}
                  dateISO={academicISO}
                />
              )}
            </>
          )}
        </section>
      </main>
    </>
  )
}
