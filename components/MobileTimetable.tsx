"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import { getCourseColor } from "./lib/colors"
import { useAlertSound } from "@/app/hooks/useAlertSound"

const DAYS = ["M", "T", "W", "Th", "F", "S"]

const DAY_LABEL: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  S: "Saturday",
}

export default function MobileTimetable({
  sessions,
}: {
  sessions: any[]
}) {
  const [activeDay, setActiveDay] = useState("M")
  const playAlert = useAlertSound()
  const alertedRef = useRef(false)

  /* ---------- GROUP BY DAY+HOUR ---------- */
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

  /* ---------- CLASHES FOR ACTIVE DAY ---------- */
  const dayClashes = useMemo(() => {
    return Array.from(clashMap.entries())
      .filter(([key, cell]) => key.startsWith(activeDay) && cell.length > 1)
      .map(([_, cell]) => cell[0])
  }, [clashMap, activeDay])

  /* ---------- PLAY SOUND ON NEW CLASH ---------- */
  useEffect(() => {
    if (dayClashes.length > 0 && !alertedRef.current) {
      playAlert()
      alertedRef.current = true
    }

    if (dayClashes.length === 0) {
      alertedRef.current = false
    }
  }, [dayClashes, playAlert])

  /* ---------- NORMAL SESSIONS ---------- */
  const daySessions = useMemo(
    () => sessions.filter(s => s.day === activeDay),
    [sessions, activeDay]
  )

  return (
    <div className="h-full flex flex-col">
      {dayClashes.length > 0 && (
        <div className="mx-3 mt-3 rounded-md border border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700 animate-shake">
          ⚠️ Clash detected<br />
          <span className="font-semibold">
            {DAY_LABEL[activeDay]} · {dayClashes[0].startTime} –{" "}
            {dayClashes[0].endTime}
          </span>
        </div>
      )}
      {/* DAY TABS */}
      <div className="flex border-b bg-[var(--bg-surface)]">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={clsx(
              "flex-1 py-2 text-sm font-semibold transition",
              activeDay === d
                ? "border-b-2 border-[var(--bg-accent)] text-[var(--bg-accent)]"
                : "text-[var(--text-muted)]"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* ⚠️ CLASH WARNING */}
      

      {/* SESSIONS */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {daySessions.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center">
            No classes
          </p>
        )}

        {daySessions.map(s => {
          const isClash =
            (clashMap.get(`${s.day}-${s.hour}`)?.length ?? 0) > 1

          return (
            <div
              key={`${s.courseCode}-${s.section}-${s.hour}`}
              className={clsx(
                "rounded-lg p-3 text-sm shadow-sm transition",
                getCourseColor(s.courseCode),
                isClash && "ring-2 ring-red-500 bg-red-100"
              )}
            >
              <div className="font-semibold">
                {s.courseCode} ({s.section})
              </div>

              <div className="text-xs mt-1">
                {s.startTime} – {s.endTime}
              </div>

              <div className="text-xs opacity-80">
                {s.room}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
