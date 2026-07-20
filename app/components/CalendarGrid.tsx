"use client"

import { useState, useMemo } from "react"
import clsx from "clsx"
import type { Session, Exam, CalendarDay } from "@/types/timetable"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Palmtree } from "lucide-react"

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const jsMonth = month - 1
  const totalDays = daysInMonth(year, jsMonth)
  const firstWeekday = new Date(year, jsMonth, 1).getDay()

  const calendarMap = new Map(
    calendar.days.map(d => [d.date, d])
  )

  const today = new Date()
  const todayISO = toLocalISO(today)

  const [showLongWeekends, setShowLongWeekends] = useState(false)

  const getDayClasses = (date: Date) => {
    const weekday = date.getDay()
    if (weekday === 0) return []
    return sessions.filter(
      s => DAY_INDEX[s.day] === weekday
    )
  }

  const getDayExams = (date: Date) => {
    const localDate = toLocalISO(date)
    return exams.filter(e => e.date === localDate)
  }

  const [leaveDays, setLeaveDays] = useState<number>(0)
  const [selectedLongWeekendIdx, setSelectedLongWeekendIdx] = useState<number | null>(null)

  const { longWeekendDates, leaveDates, longWeekendBlocks } = useMemo(() => {
    if (!showLongWeekends) return { longWeekendDates: new Set<string>(), leaveDates: new Set<string>(), longWeekendBlocks: [] }
    
    // Academic year runs approx Aug to May, but let's check current semester
    // We'll just check +/- 4 months from currently viewed month
    const start = new Date(year, month - 4, 1)
    const end = new Date(year, month + 2, 0)
    
    const isDayOff = (d: Date) => {
       const iso = toLocalISO(d)
       if (calendarMap.get(iso)?.holiday) return true
       if (calendarMap.get(iso)?.label?.includes("VACATION")) return true
       if (getDayClasses(d).length > 0 || getDayExams(d).length > 0) return false
       return true
    }

    const days: { date: Date, iso: string, isOff: boolean }[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
       days.push({ date: new Date(d), iso: toLocalISO(d), isOff: isDayOff(d) })
    }

    const bestBlocks: { startIdx: number, endIdx: number, leavesUsed: number[] }[] = []

    for (let i = 0; i < days.length; i++) {
       let workingDays = 0
       let leavesUsedForThisWindow: number[] = []
       let j = i
       
       while (j < days.length) {
          if (!days[j].isOff) {
             if (workingDays < leaveDays) {
                workingDays++
                leavesUsedForThisWindow.push(j)
             } else {
                break
             }
          }
          j++
       }
       
       const length = j - i
       // A normal long weekend is 3 days. With 1 leave, you expect a 4-day weekend (otherwise it's just a normal weekend).
       // With 2 leaves, you expect a 5-day weekend.
       if (length >= 3 + leaveDays) {
          bestBlocks.push({ startIdx: i, endIdx: j - 1, leavesUsed: [...leavesUsedForThisWindow] })
       }
    }

    // Filter to maximal blocks (blocks not fully contained within another block)
    let maximalBlocks = bestBlocks.filter(a => {
       return !bestBlocks.some(b => b !== a && b.startIdx <= a.startIdx && b.endIdx >= a.endIdx)
    })

    maximalBlocks = maximalBlocks.sort((a, b) => a.startIdx - b.startIdx)

    const lwDates = new Set<string>()
    const lvDates = new Set<string>()
    const blocksData: { dates: string[], leaves: string[] }[] = []

    maximalBlocks.forEach(b => {
       const bDates = []
       const bLeaves = []
       for (let k = b.startIdx; k <= b.endIdx; k++) {
          const iso = days[k].iso
          lwDates.add(iso)
          bDates.push(iso)
          if (b.leavesUsed.includes(k)) {
             lvDates.add(iso)
             bLeaves.push(iso)
          }
       }
       blocksData.push({ dates: bDates, leaves: bLeaves })
    })

    const todayZero = new Date()
    todayZero.setHours(0,0,0,0)

    const filteredBlocks = blocksData.filter(b => new Date(b.dates[b.dates.length-1]) >= todayZero)

    return { longWeekendDates: lwDates, leaveDates: lvDates, longWeekendBlocks: filteredBlocks }
  }, [showLongWeekends, sessions, exams, calendarMap, year, month, leaveDays])

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
    <main className="p-2 sm:px-6 sm:py-4 max-w-7xl mx-auto w-full h-[calc(100vh-64px)] flex flex-col md:flex-row gap-4">
      <div className="flex flex-col flex-1 min-w-0">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <button
          onClick={prevMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 hover:-translate-x-0.5"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Prev
        </button>

        <div className="flex flex-col items-center">
          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {new Date(year, jsMonth).toLocaleString("default", { month: "long" })} {year}
          </h1>
          <button
            onClick={() => {
              setShowLongWeekends(s => !s)
              setSelectedLongWeekendIdx(null)
            }}
            className={clsx(
              "mt-1 text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-semibold transition-all border flex items-center gap-1.5",
              showLongWeekends 
                ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800 shadow-sm"
                : "text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] bg-[var(--bg-surface)]"
            )}
          >
            <Palmtree size={14} /> 
            {showLongWeekends ? "Hide Long Weekends" : "Find Long Weekends"}
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 hover:translate-x-0.5"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
        >
          Next
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* NO SCROLL - FIT HEIGHT */}
      <div
        className="w-full flex-1 rounded-2xl border flex flex-col min-h-0 overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* WEEK HEADER */}
        <div
          className="grid grid-cols-7 text-[10px] sm:text-xs font-bold shrink-0 border-b"
          style={{
            backgroundColor: "var(--bg-surface-hover)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center py-2.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* GRID */}
        <div
          className="grid grid-cols-7 auto-rows-fr gap-px text-[11px] flex-1 min-h-0"
          style={{ backgroundColor: "var(--border-subtle)" }}
        >
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} style={{ backgroundColor: "var(--bg-surface)" }} />
          ))}

          {Array.from({ length: totalDays }, (_, i) => {
            const dateObj = new Date(year, jsMonth, i + 1)
            const iso = toLocalISO(dateObj)
            const meta = calendarMap.get(iso)
            const dayExams = getDayExams(dateObj)
            const isToday = iso === todayISO

            let isLongWeekend = false
            let isLeaveDate = false

            if (selectedLongWeekendIdx !== null && longWeekendBlocks[selectedLongWeekendIdx]) {
                const block = longWeekendBlocks[selectedLongWeekendIdx]
                if (block.dates.includes(iso)) {
                    isLongWeekend = true
                }
                if (block.leaves.includes(iso)) {
                    isLeaveDate = true
                }
            }

            let bgColor = "var(--bg-surface)"
            let hoverColor = "var(--bg-surface-hover)"
            if (isLeaveDate) {
              bgColor = "rgba(245,158,11,0.3)" // Amber
              hoverColor = "rgba(245,158,11,0.4)"
            }
            else if (isLongWeekend) { 
              bgColor = "rgba(99,102,241,0.25)" // Indigo contrasting color
              hoverColor = "rgba(99,102,241,0.35)" 
            }
            else if (meta?.holiday) { bgColor = "rgba(34,197,94,0.12)"; hoverColor = "rgba(34,197,94,0.2)"; }
            else if (dayExams.length > 0) { bgColor = "rgba(239,68,68,0.12)"; hoverColor = "rgba(239,68,68,0.2)"; }

            return (
              <div
                key={iso}
                onClick={() => setSelectedDate(dateObj)}
                className="cursor-pointer p-1.5 sm:p-2.5 transition-all relative group flex flex-col overflow-hidden min-h-0"
                style={{ backgroundColor: bgColor }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = bgColor}
              >
                {/* Today ring */}
                {isToday && (
                  <div
                    className="absolute inset-0 border-2 pointer-events-none rounded-sm"
                    style={{ borderColor: "var(--bg-accent)" }}
                  />
                )}

                {/* Subtle hover border */}
                {!isToday && (
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--bg-accent)] pointer-events-none transition-colors rounded-sm opacity-40" />
                )}

                <div
                  className={clsx(
                    "font-bold text-xs sm:text-sm mb-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full",
                    isToday ? "text-white" : ""
                  )}
                  style={{
                    color: isToday ? "white" : "var(--text-primary)",
                    backgroundColor: isToday ? "var(--bg-accent)" : "transparent",
                    fontSize: isToday ? "11px" : undefined,
                  }}
                >
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
                      style={{ backgroundColor: "rgba(239,68,68,0.85)" }}
                    >
                      {e.courseCode} EXAM
                    </div>
                  ))}
                </div>

                {showHint(dateObj, meta) && (
                  <div
                    className="mt-1 text-[9px] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click for schedule
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      </div>

      {/* LONG WEEKENDS SIDEBAR */}
      <AnimatePresence>
      {showLongWeekends && (
        <motion.div 
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: "auto" }}
          exit={{ opacity: 0, x: 20, width: 0 }}
          className="w-full md:w-64 flex-shrink-0 flex flex-col rounded-2xl border overflow-hidden min-h-0"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div 
            className="p-3 border-b text-sm font-bold flex flex-col gap-3"
            style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Palmtree size={14} className="text-emerald-500" /> Upcoming Long Weekends</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-muted)] font-semibold">
                {longWeekendBlocks.length}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-2 bg-[var(--bg-surface)] p-1.5 rounded-lg border border-[var(--border-subtle)]">
               <span className="text-xs font-semibold text-[var(--text-muted)] pl-1">Take Leaves:</span>
               <div className="flex bg-[var(--bg-muted)] rounded-md p-0.5 gap-0.5">
                  {[0,1,2].map(num => (
                     <button
                        key={num}
                        onClick={() => {
                          setLeaveDays(num)
                          setSelectedLongWeekendIdx(null)
                        }}
                        className={clsx(
                           "px-2.5 py-1 text-[10px] font-bold rounded transition-colors",
                           leaveDays === num
                              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                     >
                        {num}
                     </button>
                  ))}
               </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {longWeekendBlocks.length === 0 ? (
              <div className="text-xs text-center p-4 text-[var(--text-muted)]">
                No long weekends found in this timeframe.
              </div>
            ) : (
              longWeekendBlocks.map((block, i) => {
                const startDate = new Date(block.dates[0])
                const endDate = new Date(block.dates[block.dates.length - 1])
                const hasLeaves = block.leaves.length > 0
                const isActive = selectedLongWeekendIdx === i
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className={clsx(
                      "p-2.5 rounded-lg border flex flex-col gap-1 cursor-pointer transition-colors active:scale-95",
                      isActive ? "ring-2 ring-indigo-500 shadow-md" : ""
                    )}
                    style={{
                      backgroundColor: hasLeaves 
                        ? (isActive ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.05)") 
                        : (isActive ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.05)"),
                      borderColor: hasLeaves 
                        ? (isActive ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.2)") 
                        : (isActive ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.2)")
                    }}
                    onClick={() => {
                      setSelectedLongWeekendIdx(i)
                      setYear(startDate.getFullYear())
                      setMonth(startDate.getMonth() + 1)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        {block.dates.length} Days Off
                      </div>
                      {hasLeaves && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#d97706" }}>
                          {block.leaves.length} LEAVE{block.leaves.length > 1 ? 'S' : ''}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                      {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                      {" - "} 
                      {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL */}
      <AnimatePresence>
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto relative border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedDate.toLocaleDateString("default", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-muted)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {getDayExams(selectedDate).length > 0 && (
              <>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                  Exams
                </h3>
                <ul className="mb-4 space-y-2">
                  {getDayExams(selectedDate).map((e, i) => (
                    <li
                      key={i}
                      className="rounded-xl px-3 py-2.5 border"
                      style={{
                        backgroundColor: "rgba(239,68,68,0.08)",
                        borderColor: "rgba(239,68,68,0.2)",
                      }}
                    >
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {e.courseCode}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {e.startTime} – {e.endTime}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
              <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: "var(--bg-accent)" }} />
              Classes
            </h3>
            {getDayClasses(selectedDate).length === 0 ? (
              <p className="text-sm py-3 text-center rounded-xl" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-surface-hover)" }}>
                No classes scheduled
              </p>
            ) : (
              <ul className="space-y-2">
                {getDayClasses(selectedDate).map((c, i) => (
                  <li
                    key={i}
                    className="rounded-xl px-3 py-2.5 border"
                    style={{
                      backgroundColor: "var(--bg-surface-hover)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {c.courseCode}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {c.startTime} – {c.endTime}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setSelectedDate(null)}
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-98"
              style={{ background: "linear-gradient(135deg, var(--bg-accent), #818cf8)" }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  )
}
