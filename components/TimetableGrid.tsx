"use client"

import clsx from "clsx"
import React, { useEffect, useMemo, useRef } from "react"
import { getCourseColor } from "./lib/colors"
import { useAlertSound } from "@/app/hooks/useAlertSound"

const DAYS = ["M", "T", "W", "Th", "F", "S"]
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

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
  const playAlert = useAlertSound()
  const hasAlertedRef = useRef(false)

  /* ---------- BUILD CELL MAP ---------- */
  const clashMap = useMemo(() => {
    const map = new Map<string, any[]>()

    for (const s of sessions) {
      const key = `${s.day}-${s.hour}`
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }

    return map
  }, [sessions])

  /* ---------- CLASH CHECK ---------- */
  const hasClash = useMemo(
    () => Array.from(clashMap.values()).some(cell => cell.length > 1),
    [clashMap]
  )

  /* ---------- ALERT SOUND ---------- */
  useEffect(() => {
    if (hasClash && !hasAlertedRef.current) {
      playAlert()
      hasAlertedRef.current = true
    }
    if (!hasClash) hasAlertedRef.current = false
  }, [hasClash, playAlert])

  return (
    <div className="relative h-full">
      {/* CLASH WARNING */}
      {hasClash && (
        <div className="mb-2 rounded-md border border-red-500 bg-red-50 px-3 py-1 text-xs text-red-700 animate-shake">
          ⚠️ Clash detected. Conflicting classes are blocked.
        </div>
      )}

      {/* MOBILE SCROLL CONTAINER */}
      <div className="relative h-full overflow-x-auto">
        <div
          className="
            grid
            min-w-[650px]   /* 👈 enables horizontal scroll on mobile */
            grid-cols-[70px_repeat(6,1fr)]
            gap-px
            bg-border
          "
        >
          {/* HEADER */}
          <div className="sticky top-0 left-0 z-30 bg-[var(--bg-surface)]" />

          {DAYS.map(d => (
            <div
              key={d}
              className="
                sticky top-0 z-20
                bg-[var(--bg-surface)]
                py-1
                text-center
                text-xs font-semibold
                border-b
              "
            >
              {d}
            </div>
          ))}

          {/* GRID */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              {/* TIME LABEL (STICKY) */}
              <div
                className="
                  sticky left-0 z-20
                  bg-[var(--bg-surface)]
                  py-1 px-1
                  text-[10px] font-medium
                  text-center
                  border-r
                "
              >
                {HOUR_LABEL[hour]}
              </div>

              {DAYS.map(day => {
                const key = `${day}-${hour}`
                const cell = clashMap.get(key) ?? []
                const isClash = cell.length > 1

                return (
                  <div
                    key={key}
                    className={clsx(
                      "relative min-h-[65px] border bg-[var(--bg-surface)] p-1 transition",
                      isClash &&
                        "ring-2 ring-red-500 bg-red-100 animate-pulse"
                    )}
                  >
                    {/* 🚫 BLOCK CLASHED SESSIONS */}
                    {!isClash &&
                      cell.map(s => (
                        <div
                          key={`${s.courseCode}-${s.section}-${s.day}-${s.hour}`}
                          className={clsx(
                            "rounded-md p-1 text-[10px] shadow-sm transition",
                            "hover:scale-[1.02]",
                            getCourseColor(s.courseCode)
                          )}
                        >
                          <div className="font-semibold leading-tight">
                            {s.courseCode}
                          </div>

                          <div className="text-[9px] leading-tight">
                            {s.startTime} – {s.endTime}
                          </div>

                          <div className="text-[9px] opacity-80 truncate">
                            {s.room}
                          </div>
                        </div>
                      ))}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
