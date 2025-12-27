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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const jsMonth = month - 1
  const totalDays = daysInMonth(year, jsMonth)
  const firstWeekday = new Date(year, jsMonth, 1).getDay()

  const calendarMap = new Map(
    calendar.days.map(d => [d.date, d])
  )

  const getDayClasses = (date: Date) => {
    const weekday = date.getDay()
    if (weekday === 0) return []
    return sessions.filter(s => DAY_INDEX[s.day] === weekday)
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
    <main className="p-4 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth}>←</button>
        <h1 className="text-xl font-semibold">
          {new Date(year, jsMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h1>
        <button onClick={nextMonth}>→</button>
      </div>

      {/* WEEK HEADER */}
      <div className="grid grid-cols-7 text-xs font-semibold mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-2 text-xs">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: totalDays }, (_, i) => {
          const dateObj = new Date(year, jsMonth, i + 1)
          const iso = dateObj.toISOString().slice(0, 10)
          const meta = calendarMap.get(iso)
          const dayExams = getDayExams(dateObj)

          return (
            <div
              key={iso}
              onClick={() => setSelectedDate(dateObj)}
              className="cursor-pointer border rounded p-2 min-h-[100px]"
            >
              <div className="font-semibold">{i + 1}</div>

              {meta?.label && (
                <div className="text-[10px] font-medium">
                  {meta.label}
                </div>
              )}

              {dayExams.map((e, idx) => (
                <div
                  key={idx}
                  className="mt-1 rounded bg-purple-100 px-1 py-[2px] text-[10px]"
                >
                  {e.courseCode} ({e.startTime})
                </div>
              ))}

              {showHint(dateObj, meta) && (
                <div className="mt-2 text-[10px] text-gray-500">
                  Click to display class schedule
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* DAY MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              {selectedDate.toDateString()}
            </h2>

            {/* EXAMS */}
            {getDayExams(selectedDate).length > 0 && (
              <>
                <h3 className="font-semibold text-sm mb-1">Exams</h3>
                <ul className="mb-3 space-y-2">
                  {getDayExams(selectedDate).map((e, i) => (
                    <li key={i} className="rounded bg-purple-100 px-3 py-2">
                      <div className="font-medium">{e.courseCode}</div>
                      <div className="text-xs">
                        {e.startTime} – {e.endTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* CLASSES */}
            <h3 className="font-semibold text-sm mb-1">Classes</h3>
            {getDayClasses(selectedDate).length === 0 ? (
              <p className="text-sm">No classes</p>
            ) : (
              <ul className="space-y-2">
                {getDayClasses(selectedDate).map((c, i) => (
                  <li key={i} className="rounded bg-blue-100 px-3 py-2">
                    <div className="font-medium">{c.courseCode}</div>
                    <div className="text-xs">
                      {c.startTime} – {c.endTime}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full bg-black text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
