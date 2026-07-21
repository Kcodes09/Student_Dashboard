"use client"

import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { checkSectionClash, ClashSession } from "@/app/lib/timetable/clashDetector"

type SectionType = "LECTURE" | "TUTORIAL" | "PRACTICAL"

type Session = {
  day: string
  startTime: string
  endTime: string
  room: string
}

type Section = {
  section: string
  type: SectionType
  instructors: string[]
  sessions: Session[]
}

type Course = {
  courseCode: string
  courseTitle: string
  sections: Section[]
}

type Props = {
  course?: Course
  selected?: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
  onSelect: (
    type: SectionType,
    section: string | undefined
  ) => void
  onBack?: () => void
  currentSessions?: ClashSession[]
}

const TYPE_LABEL: Record<SectionType, string> = {
  LECTURE: "L",
  TUTORIAL: "T",
  PRACTICAL: "P",
}

export default function SectionSidebar({
  course,
  selected = {},
  onSelect,
  onBack,
  currentSessions = [],
}: Props) {
  /* ---------- AVAILABLE TYPES ---------- */
  const availableTypes = useMemo<SectionType[]>(() => {
    if (!course) return []
    return Array.from(
      new Set(course.sections.map(s => s.type))
    )
  }, [course])

  const [activeType, setActiveType] =
    useState<SectionType | null>(null)

  useEffect(() => {
    if (!activeType && availableTypes.length > 0) {
      setActiveType(availableTypes[0])
    }
  }, [availableTypes, activeType])

  if (!course || !activeType) {
    return null
  }

  const sections = course.sections.filter(
    s => s.type === activeType
  )

  return (
    <aside className="w-full md:w-96 h-full min-h-0 flex flex-col bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface-hover)] border-r border-[var(--border-subtle)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20">


      {/* ---------- TOP BAR ---------- */}
      <div className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 backdrop-blur-md">
        {onBack && (
          <button
            onClick={onBack}
            className="
              w-full px-4 py-3
              text-left text-sm
              text-[var(--text-muted)]
              hover:text-[var(--text-primary)]
            "
          >
            ← Back
          </button>
        )}

        {/* HEADER */}
        <div className="px-5 pb-4 pt-1">
          <h2 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[var(--bg-accent)]">
            {course.courseCode}
          </h2>
          <p className="text-xs font-medium text-[var(--text-muted)] line-clamp-1 mt-0.5">
            {course.courseTitle}
          </p>

          {/* TABS */}
          <div className="mt-4 flex gap-1.5 p-1 rounded-lg bg-[var(--bg-muted)]/50 border border-[var(--border-subtle)]">
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={clsx(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-bold transition-all duration-300",
                  activeType === type
                    ? "bg-gradient-to-r from-[var(--bg-accent)] to-[var(--bg-selected)] text-white shadow-sm scale-100"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                )}
              >
                {TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- SCROLLABLE SECTIONS ---------- */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-2.5 scroll-smooth">

        {sections.map(section => {
          const isSelected =
            selected[activeType] === section.section

          const clashInfo = !isSelected ? checkSectionClash(section.sessions, course.courseCode, section.type, currentSessions) : null;

          return (
            <button
              key={section.section}
              onClick={() =>
                onSelect(
                  activeType,
                  isSelected ? undefined : section.section
                )
              }
              className={clsx(
                "w-full rounded-xl border px-4 py-3 text-left transition-all duration-300 relative group overflow-hidden",
                isSelected
                  ? "border-[var(--bg-accent)] bg-[var(--bg-selected)] shadow-[inset_0_0_0_1px_var(--bg-accent)]"
                  : clashInfo
                    ? "border-red-300 hover:border-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 shadow-sm"
                    : "border-[var(--border-subtle)] hover:border-[var(--bg-accent)] hover:bg-[var(--bg-surface)] hover:shadow-sm"
              )}
            >
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <span className={clsx("text-sm font-bold leading-tight", isSelected ? "text-[var(--text-accent)]" : clashInfo ? "text-red-700 dark:text-red-400" : "text-[var(--text-primary)]")}>
                  {section.section || section.instructors.join(", ")}
                </span>
                {isSelected && (
                  <span className="flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-accent)] text-[10px] text-white shadow-sm mt-0.5">
                    ✓
                  </span>
                )}
                {clashInfo && (
                  <span className="flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm mt-0.5" title={`Clashes with ${clashInfo.course2} ${clashInfo.section2}`}>
                    !
                  </span>
                )}
              </div>

              {section.section && (
                <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
                  {section.instructors.join(", ")}
                </div>
              )}

              {section.sessions && section.sessions.length > 0 && (() => {
                // Get unique time slot (all sessions usually same time)
                const { startTime, endTime } = section.sessions[0]
                const fmt = (t: string) => {
                  const [h, m] = t.split(":").map(Number)
                  const ampm = h >= 12 ? "PM" : "AM"
                  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`
                }
                const days = section.sessions.map(s => s.day).join(" ")
                return (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-primary)]">
                      {days}
                    </span>
                    <span className={clsx("text-xs font-mono font-medium", isSelected ? "text-[var(--text-accent)]" : clashInfo ? "text-red-600 dark:text-red-300" : "text-[var(--text-muted)]")}>
                      {fmt(startTime)} – {fmt(endTime)}
                    </span>
                  </div>
                )
              })()}

              {clashInfo && (
                <div className="mt-2 text-[10px] font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                  Clashes with {clashInfo.course2} {clashInfo.section2} ({clashInfo.day} {clashInfo.timeStr.split('/')[1].trim()})
                </div>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
