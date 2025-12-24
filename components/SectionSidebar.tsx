"use client"

import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"

type SectionType = "LECTURE" | "TUTORIAL" | "PRACTICAL"

type Section = {
  section: string
  type: SectionType
  instructors: string[]
}

type Course = {
  courseCode: string
  courseTitle: string
  sections: Section[]
}

type Props = {
  course?: Course
  selected?: Partial<Record<SectionType, string>>
  onSelect: (type: SectionType, section?: string) => void
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
    return (
      <aside className="w-96 border-r bg-[var(--bg-surface)] p-4">
        <p className="text-sm text-[var(--text-muted)]">
          Select a course to view sections
        </p>
      </aside>
    )
  }

  const sections = course.sections.filter(
    s => s.type === activeType
  )

  return (
    <aside className="w-96 h-full border-r bg-[var(--bg-surface)] flex flex-col">
      {/* HEADER (FIXED) */}
      <div className="p-4 border-b shrink-0">
        <h2 className="text-sm font-semibold">
          {course.courseCode}
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {course.courseTitle}
        </p>

        {/* TABS */}
        <div className="mt-3 flex gap-1">
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={clsx(
                "flex-1 rounded-md px-2 py-1 text-xs font-semibold transition",
                activeType === type
                  ? "bg-[var(--bg-accent)] text-white"
                  : "bg-[var(--bg-surface-hover)] text-[var(--text-muted)]"
              )}
            >
              {TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map(section => {
          const isSelected =
            selected[activeType] === section.section

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
                "w-full rounded-lg border px-3 py-2 text-left transition",
                "hover:bg-[var(--bg-surface-hover)]",
                isSelected &&
                  "border-[var(--bg-accent)] bg-[var(--bg-selected)]"
              )}
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {section.section}
                </span>
                {isSelected && (
                  <span className="text-xs text-[var(--bg-accent)]">
                    ✓
                  </span>
                )}
              </div>

              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {section.instructors.join(", ")}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
