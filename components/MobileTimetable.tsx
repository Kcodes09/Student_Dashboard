"use client"

import clsx from "clsx"
import { useMemo, useState } from "react"
import { getCourseColor } from "./lib/colors"

const DAYS = ["M", "T", "W", "Th", "F", "S"]

export default function MobileTimetable({ sessions }: { sessions: any[] }) {
  const [day, setDay] = useState("M")

  const daySessions = useMemo(() => {
    return sessions
      .filter(s => s.day === day)
      .sort((a, b) => a.hour - b.hour)
  }, [sessions, day])

  return (
    <div className="md:hidden p-3 space-y-3">
      {/* DAY SELECTOR */}
      <div className="flex justify-between gap-1">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={clsx(
              "flex-1 rounded-md py-1 text-xs font-medium transition",
              d === day
                ? "bg-[var(--bg-accent)] text-white"
                : "bg-[var(--bg-surface)]"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* SESSIONS */}
      {daySessions.length === 0 && (
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          No classes for this day
        </p>
      )}

      <div className="space-y-2">
        {daySessions.map(s => (
          <div
            key={`${s.courseCode}-${s.section}-${s.hour}`}
            className={clsx(
              "rounded-lg p-3 text-sm shadow",
              getCourseColor(s.courseCode)
            )}
          >
            <div className="font-semibold">
              {s.courseCode} ({s.section})
            </div>

            <div className="text-xs opacity-80 mt-1">
              {s.startTime} – {s.endTime}
            </div>

            <div className="text-xs opacity-80">
              {s.room}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
