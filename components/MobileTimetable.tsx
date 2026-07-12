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
  const daySessions = useMemo(() => {
  return sessions
    .filter(s => s.day === activeDay)
    .sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour
      return a.startTime.localeCompare(b.startTime)
    })
}, [sessions, activeDay])


  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)]">
      {dayClashes.length > 0 && (
        <div className="mx-3 mt-3 shrink-0 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 animate-shake flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Clash detected</span>
            <span>
              {DAY_LABEL[activeDay]} · {dayClashes[0].startTime} –{" "}
              {dayClashes[0].endTime}
            </span>
          </div>
        </div>
      )}
      {/* DAY TABS */}
      <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] shadow-sm">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={clsx(
              "flex-1 py-3 text-sm font-bold transition-all relative",
              activeDay === d
                ? "text-[var(--text-accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
            )}
          >
            {d}
            {activeDay === d && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--bg-accent)] rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      {/* SESSIONS */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--bg-main)]">
        {daySessions.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              No classes scheduled
            </p>
          </div>
        )}

        {daySessions.map(s => {
          const isClash =
            (clashMap.get(`${s.day}-${s.hour}`)?.length ?? 0) > 1

          return (
            <div
              key={`${s.courseCode}-${s.section}-${s.hour}`}
              className={clsx(
                "rounded-xl p-3.5 shadow-sm transition-all border",
                getCourseColor(s.courseCode),
                isClash ? "ring-2 ring-red-500 bg-red-500/10 border-red-500/50" : "border-transparent"
              )}
            >
              <div className="font-bold tracking-tight text-base mb-1">
                {s.courseCode} <span className="opacity-80 font-medium">{s.type === "LECTURE" ? "(L)" : s.type === "PRACTICAL" ? "(P)" : s.type === "TUTORIAL" ? "(T)" : ""}</span> <span className="opacity-75 font-normal text-xs ml-1">Sec: {s.section}</span>
              </div>

              <div className="text-sm font-medium opacity-90 flex items-center justify-between mt-2">
                <span>{s.startTime} – {s.endTime}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/20 font-bold">{s.room}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
