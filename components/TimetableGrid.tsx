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
    <div className="relative h-fit">
      {/* CLASH WARNING */}
      {hasClash && (
        <div className="mb-2 shrink-0 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 animate-shake flex items-center gap-2">
          <span>⚠️</span>
          <span>Clash detected. Conflicting classes are highlighted.</span>
        </div>
      )}

      {/* MOBILE SCROLL CONTAINER */}
      <div className="relative overflow-x-auto rounded-xl border border-[var(--border-subtle)] shadow-sm h-fit">
        <div
          className="
            grid
            min-w-[700px]   /* enables horizontal scroll on mobile */
            grid-cols-[60px_repeat(6,1fr)]
            gap-px
            bg-[var(--border-subtle)]
          "
        >
          {/* HEADER ROW */}
          <div className="sticky top-0 left-0 z-30 bg-[var(--bg-surface-hover)]" />

          {DAYS.map(d => (
            <div
              key={d}
              className="
                sticky top-0 z-20
                bg-[var(--bg-surface-hover)]
                py-2
                text-center
                text-xs font-bold uppercase tracking-wider
                text-[var(--text-muted)]
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
                  bg-[var(--bg-surface-hover)]
                  py-1.5 px-1
                  text-[9px] font-semibold
                  text-center text-[var(--text-muted)]
                  flex items-center justify-center
                "
              >
                <span className="-rotate-90 md:rotate-0 whitespace-nowrap">{HOUR_LABEL[hour]}</span>
              </div>

              {DAYS.map(day => {
                const key = `${day}-${hour}`
                const cell = clashMap.get(key) ?? []
                const isClash = cell.length > 1

                return (
                  <div
                    key={key}
                    className={clsx(
                      "relative min-h-[55px] bg-[var(--bg-surface)] p-1 transition-colors hover:bg-[var(--bg-surface-hover)]",
                      isClash && "ring-2 ring-inset ring-red-500/70 bg-red-500/10 animate-pulse"
                    )}
                  >
                    {/* 🚫 BLOCK CLASHED SESSIONS */}
                    {!isClash &&
                      cell.map(s => (
                        <div
                          key={`${s.courseCode}-${s.section}-${s.day}-${s.hour}`}
                          className={clsx(
                            "rounded-md p-1.5 text-[10px] shadow-sm transition-transform",
                            "hover:scale-[1.03] hover:shadow-md hover:z-10 relative cursor-pointer",
                            getCourseColor(s.courseCode)
                          )}
                        >
                          <div className="font-bold tracking-tight leading-none mb-0.5">
                            {s.courseCode} <span className="opacity-80 font-medium">{s.type === "LECTURE" ? "(L)" : s.type === "PRACTICAL" ? "(P)" : s.type === "TUTORIAL" ? "(T)" : ""}</span>
                          </div>

                          <div className="text-[9px] leading-tight font-medium opacity-90">
                            {s.startTime} – {s.endTime}
                          </div>

                          <div className="text-[9px] opacity-75 truncate mt-0.5">
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
