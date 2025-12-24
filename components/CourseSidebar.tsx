"use client"

import { useMemo, useState } from "react"
import clsx from "clsx"

type Props = {
  courses: any[]
  activeCourse: string | null
  onSelect: (courseCode: string) => void
}

type SortType = "CODE_ASC" | "CODE_DESC" | "NAME" | "CREDITS"

export default function CourseSidebar({
  courses,
  activeCourse,
  onSelect,
}: Props) {
  const [sortBy, setSortBy] = useState<SortType>("CODE_ASC")

  const sortedCourses = useMemo(() => {
    const copy = [...courses]
    switch (sortBy) {
      case "CODE_ASC":
        return copy.sort((a, b) =>
          a.courseCode.localeCompare(b.courseCode)
        )
      case "CODE_DESC":
        return copy.sort((a, b) =>
          b.courseCode.localeCompare(a.courseCode)
        )
      case "NAME":
        return copy.sort((a, b) =>
          a.courseTitle.localeCompare(b.courseTitle)
        )
      case "CREDITS":
        return copy.sort((a, b) => b.credits - a.credits)
      default:
        return copy
    }
  }, [courses, sortBy])

  return (
    <aside className="w-80 border-r bg-[var(--bg-surface)] p-4 overflow-y-auto">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">
          Courses
        </h2>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortType)}
          className="rounded-md border px-2 py-1 text-xs"
        >
          <option value="CODE_ASC">Code A–Z</option>
          <option value="CODE_DESC">Code Z–A</option>
          <option value="NAME">Name</option>
          <option value="CREDITS">Credits</option>
        </select>
      </div>

      {/* COURSE LIST */}
      <div className="space-y-1">
        {sortedCourses.map(c => {
          const isActive = activeCourse === c.courseCode

          return (
            <button
              key={c.courseCode}
              onClick={() => onSelect(c.courseCode)}
              className={clsx(
                "w-full rounded-lg px-3 py-2 text-left transition",
                "hover:bg-[var(--bg-hover)]",
                isActive &&
                  "bg-[var(--bg-selected)] ring-1 ring-[var(--bg-accent)]"
              )}
            >
              <div className="font-medium text-sm">
                {c.courseCode}
              </div>
              <div className="truncate text-xs text-[var(--text-muted)]">
                {c.courseTitle}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
