"use client"

import { useState } from "react"
import clsx from "clsx"
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

/* ✅ LOCAL DATE STRING (NO UTC SHIFT) */
function toLocalISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
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

  /* ✅ FIXED — NO toISOString() */
  const getDayExams = (date: Date) => {
    const localDate = toLocalISO(date)
    return exams.filter(e => e.date === localDate)
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
    <main className="p-2 sm:px-6 sm:py-4 max-w-7xl mx-auto w-full h-[calc(100vh-64px)] flex flex-col">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-all active:scale-95 text-sm font-bold shadow-sm">← Prev</button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {new Date(year, jsMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h1>
        <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-all active:scale-95 text-sm font-bold shadow-sm">Next →</button>
      </div>

      {/* NO SCROLL - FIT HEIGHT */}
      <div className="w-full flex-1 rounded-xl shadow-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col min-h-0 overflow-hidden">
        {/* WEEK HEADER */}
        <div className="grid grid-cols-7 text-[10px] sm:text-xs font-bold shrink-0 border-b border-[var(--border-subtle)]"
          style={{ backgroundColor: "var(--bg-surface-hover)" }}
        >
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center py-2.5 uppercase tracking-wider text-[var(--text-muted)]">{d}</div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px text-[11px] bg-[var(--border-subtle)] flex-1 min-h-0">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--bg-surface)]" />
          ))}

          {Array.from({ length: totalDays }, (_, i) => {
            const dateObj = new Date(year, jsMonth, i + 1)
            const iso = toLocalISO(dateObj)
            const meta = calendarMap.get(iso)
            const dayExams = getDayExams(dateObj)

            let bgColor = "var(--bg-surface)"
            let hoverColor = "var(--bg-surface-hover)"
            if (meta?.holiday) { bgColor = "rgba(34,197,94,0.3)"; hoverColor = "rgba(34,197,94,0.4)"; }
            else if (dayExams.length > 0) { bgColor = "rgba(239,68,68,0.3)"; hoverColor = "rgba(239,68,68,0.4)"; }

            return (
              <div
                key={iso}
                onClick={() => setSelectedDate(dateObj)}
                className="cursor-pointer p-1.5 sm:p-2.5 transition-all relative group flex flex-col overflow-hidden min-h-0"
                style={{
                  backgroundColor: bgColor,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
              >
                  {/* Subtle inner border on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--bg-accent)] pointer-events-none transition-colors" />
                  
                  <div className="font-bold text-xs sm:text-sm mb-1 text-[var(--text-primary)]">
                    {i + 1}
                  </div>

                  {meta?.label && (
                    <div className={clsx(
                      "text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-2 mb-1 px-1 py-0.5 rounded-sm",
                      meta.holiday 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : "bg-[var(--bg-selected)] text-[var(--text-accent)]"
                    )}>
                      {meta.label}
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5 mt-auto">
                    {dayExams.map((e, idx) => (
                      <div
                        key={idx}
                        className="rounded px-1 py-[2px] text-[8px] sm:text-[9px] font-bold truncate text-white shadow-sm"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.8)",
                        }}
                      >
                        {e.courseCode} EXAM
                      </div>
                    ))}
                  </div>

                  {showHint(dateObj, meta) && (
                    <div className="mt-1 text-[9px] text-[var(--text-muted)] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                      Click for schedule
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* MODAL */}
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
                <h3 className="font-semibold text-sm mb-1">Exams</h3>
                <ul className="mb-3 space-y-2">
                  {getDayExams(selectedDate).map((e, i) => (
                    <li key={i} className="rounded px-3 py-2"
                      style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
                    >
                      <div className="font-medium">{e.courseCode}</div>
                      <div className="text-xs">
                        {e.startTime} – {e.endTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="font-semibold text-sm mb-1">Classes</h3>
            {getDayClasses(selectedDate).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No classes
              </p>
            ) : (
              <ul className="space-y-2">
                {getDayClasses(selectedDate).map((c, i) => (
                  <li key={i} className="rounded px-3 py-2"
                    style={{ backgroundColor: "var(--bg-muted)" }}
                  >
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
