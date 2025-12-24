"use client"

import clsx from "clsx"
import React from "react"
import { getCourseColor } from "./lib/colors"

const DAYS = ["M", "T", "W", "Th", "F", "S"]

const HOURS = [1,2,3,4,5,6,7,8,9,10,11,12]

const HOUR_LABEL: Record<number, string> = {
  1: "08:00 - 08:50",
  2: "09:00 - 09:50",
  3: "10:00 - 10:50",
  4: "11:00 - 11:50",
  5: "12:00 - 12:50",
  6: "13:00 - 13:50",
  7: "14:00 - 14:50",
  8: "15:00 - 15:50",
  9: "16:00 - 16:50",
  10: "17:00 - 17:50",
  11: "18:00 - 18:50",
  12: "19:00 - 19:50",
}

export default function TimetableGrid({ sessions }: { sessions: any[] }) {
  return (
    <div className="grid grid-cols-[90px_repeat(6,1fr)] gap-px bg-border">
      {/* HEADER */}
      <div />
      {DAYS.map(d => (
        <div
          key={d}
          className="bg-[var(--bg-surface)] p-2 text-center text-sm font-semibold"
        >
          {d}
        </div>
      ))}

      {/* GRID */}
      {HOURS.map(hour => (
        <React.Fragment key={hour}>
          {/* TIME LABEL */}
          <div className="bg-[var(--bg-surface)] p-2 text-xs font-medium">
            {HOUR_LABEL[hour]}
          </div>

          {DAYS.map(day => {
            const cell = sessions.filter(
              s => s.day === day && s.hour === hour
            )

            const clash = cell.length > 1

            return (
              <div
                key={`${day}-${hour}`}
                className={clsx(
                  "relative min-h-[90px] border bg-[var(--bg-surface)] p-1",
                  clash && "ring-2 ring-red-500"
                )}
              >
                {cell.map(s => (
                  <div
                    key={`${s.courseCode}-${s.section}-${hour}`}
                    className={clsx(
                      "mb-1 rounded-md p-2 text-xs text-white shadow",
                      getCourseColor(s.courseCode)
                    )}
                  >
                    {/* COURSE */}
                    <div className="font-semibold">
                      {s.courseCode} ({s.section})
                    </div>

                    {/* ROOM */}
                    <div className="text-[11px] opacity-90">
                      Room: {s.room}
                    </div>

                    {/* INSTRUCTOR */}
                    {s.instructors && (
                      <div className="mt-1 text-[11px] italic opacity-95">
                        {s.instructors.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}
