"use client"

import { useState } from "react"
import type { Session, Exam, CalendarDay } from "@/types/timetable"

const DAY_INDEX: Record<Session["day"], number> = {
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  S: 6,
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export default function CalendarGrid({
  sessions,
  exams,
  calendar,
  initialYear,
  initialMonth,
}: {
  sessions: Session[]
  exams: Exam[]
  calendar: { year: number; days: CalendarDay[] }
  initialYear: number
  initialMonth: number
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null)

  const jsMonth = month - 1
  const totalDays = daysInMonth(year, jsMonth)
  const firstWeekday = new Date(year, jsMonth, 1).getDay()

  const calendarMap = new Map(
    calendar.days.map(d => [d.date, d])
  )

  const getDayClasses = (date: Date) => {
    const weekday = date.getDay()
    if (weekday === 0) return []
    return sessions.filter(
      s => DAY_INDEX[s.day] === weekday
    )
  }

  const getDayExams = (date: Date) => {
    const iso = date.toISOString().slice(0, 10)
    return exams.filter(e => e.date === iso)
  }

  const showHint = (date: Date, meta?: CalendarDay) => {
    if (date.getDay() === 0) return false
    if (meta?.holiday) return false
    if (meta?.label?.includes("VACATION")) return false
    if (getDayExams(date).length > 0) return false
    return true
  }

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else setMonth(m => m + 1)
  }

  return (
    <main className="p-2 sm:p-4 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth}>←</button>
        <h1 className="text-lg sm:text-xl font-semibold">
          {new Date(year, jsMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h1>
        <button onClick={nextMonth}>→</button>
      </div>

      {/* SCROLL WRAPPER */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] sm:min-w-0">
          {/* WEEK HEADER */}
          <div
            className="grid grid-cols-7 text-[11px] font-semibold mb-1 sticky top-0 z-10"
            style={{ backgroundColor: "var(--bg-main)" }}
          >
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map(d => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-7 gap-1 text-[11px]">
            {Array.from({ length: firstWeekday }).map(
              (_, i) => (
                <div key={`empty-${i}`} />
              )
            )}

            {Array.from({ length: totalDays }, (_, i) => {
              const dateObj = new Date(
                year,
                jsMonth,
                i + 1
              )
              const iso = dateObj
                .toISOString()
                .slice(0, 10)
              const meta = calendarMap.get(iso)
              const dayExams = getDayExams(dateObj)

              // 🎨 NEW: background logic
              let bgColor = "var(--bg-surface)"

              if (meta?.holiday) {
                bgColor = "rgba(34,197,94,0.15)" // green
              } else if (dayExams.length > 0) {
                bgColor = "rgba(239,68,68,0.15)" // red
              }

              return (
                <div
                  key={iso}
                  onClick={() => setSelectedDate(dateObj)}
                  className="cursor-pointer rounded p-1 sm:p-2 min-h-[72px] sm:min-h-[100px]"
                  style={{
                    backgroundColor: bgColor,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="font-semibold text-xs sm:text-sm">
                    {i + 1}
                  </div>

                  {meta?.label && (
                    <div className="text-[9px] sm:text-[10px] font-medium text-[var(--text-muted)]">
                      {meta.label}
                    </div>
                  )}

                  {dayExams.map((e, idx) => (
                    <div
                      key={idx}
                      className="mt-0.5 rounded px-1 py-[1px] text-[9px] sm:text-[10px]"
                      style={{
                        backgroundColor:
                          "rgba(239,68,68,0.6)", // red pill
                        color: "white",
                      }}
                    >
                      {e.courseCode}
                    </div>
                  ))}

                  {showHint(dateObj, meta) && (
                    <div className="mt-1 text-[9px] text-[var(--text-muted)] hidden sm:block">
                      Click to display class schedule
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* DAY MODAL (unchanged except colors auto-adapt) */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
          <div
            className="rounded-xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <h2 className="text-lg font-semibold mb-2">
              {selectedDate.toDateString()}
            </h2>

            {getDayExams(selectedDate).length > 0 && (
              <>
                <h3 className="font-semibold text-sm mb-1">
                  Exams
                </h3>
                <ul className="mb-3 space-y-2">
                  {getDayExams(selectedDate).map((e, i) => (
                    <li
                      key={i}
                      className="rounded px-3 py-2"
                      style={{
                        backgroundColor:
                          "rgba(239,68,68,0.15)",
                      }}
                    >
                      <div className="font-medium">
                        {e.courseCode}
                      </div>
                      <div className="text-xs">
                        {e.startTime} – {e.endTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="font-semibold text-sm mb-1">
              Classes
            </h3>
            {getDayClasses(selectedDate).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No classes
              </p>
            ) : (
              <ul className="space-y-2">
                {getDayClasses(selectedDate).map((c, i) => (
                  <li
                    key={i}
                    className="rounded px-3 py-2"
                    style={{
                      backgroundColor:
                        "var(--bg-muted)",
                    }}
                  >
                    <div className="font-medium">
                      {c.courseCode}
                    </div>
                    <div className="text-xs">
                      {c.startTime} – {c.endTime}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full py-2 rounded"
              style={{
                backgroundColor: "var(--bg-accent)",
                color: "white",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
