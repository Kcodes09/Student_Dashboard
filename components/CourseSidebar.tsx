"use client"

import { useMemo, useState } from "react"
import clsx from "clsx"

type Course = {
  courseCode: string
  courseTitle: string
  credits: number
}

type Props = {
  courses: Course[]
  activeCourse: string | null
  onSelect: (code: string | null) => void

  search: string
  setSearch: (v: string) => void
}



type SortType = "CODE_ASC" | "CODE_DESC" | "NAME" | "CREDITS"

export default function CourseSidebar({
  courses,
  activeCourse,
  onSelect, search="", setSearch
}: Props) {
  
  const [sortBy, setSortBy] = useState<SortType>("CODE_ASC")

  /* ---------- SORT ---------- */
  const sortedCourses = useMemo(() => {
    const list = [...courses]

    switch (sortBy) {
      case "CODE_ASC":
        return list.sort((a, b) =>
          a.courseCode.localeCompare(b.courseCode)
        )
      case "CODE_DESC":
        return list.sort((a, b) =>
          b.courseCode.localeCompare(a.courseCode)
        )
      case "NAME":
        return list.sort((a, b) =>
          a.courseTitle.localeCompare(b.courseTitle)
        )
      case "CREDITS":
        return list.sort((a, b) => b.credits - a.credits)
      default:
        return list
    }
  }, [courses, sortBy])

  /* ---------- SEARCH ---------- */
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return sortedCourses
    const q = search.toLowerCase()

    return sortedCourses.filter(
      c =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q)
    )
  }, [sortedCourses, search])

  return (
    <aside
      className="
        w-full md:w-80
        h-screen
        shrink-0
        border-r border-[var(--border-subtle)]
        bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface-hover)]
        shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        flex flex-col
        relative z-10
      "
    >
      {/* HEADER */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[var(--bg-accent)]">
          Course Catalog
        </h2>
      </div>

      {/* SEARCH */}
      <div className="px-4 shrink-0">
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search course code or name"
            className="
              mb-4 w-full rounded-xl border border-[var(--border-subtle)]
              bg-[var(--bg-surface)]/80 backdrop-blur-sm
              px-4 py-2.5 text-sm
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--bg-accent)]
              focus:border-[var(--bg-accent)]
              shadow-sm
              transition-all
            "
          />
        </div>
      </div>

      {/* SORT */}
      <div className="relative px-4 mb-4 shrink-0">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortType)}
          className="
            w-full appearance-none
            rounded-lg border border-[var(--border-subtle)]
            bg-[var(--bg-surface)]/60 backdrop-blur-sm
            px-3 py-2 pr-8
            text-xs font-medium
            text-[var(--text-primary)]
            shadow-sm
            transition-all
            hover:bg-[var(--bg-surface-hover)]
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--bg-accent)]
          "
        >
          <option value="CODE_ASC">Sort: Code A–Z</option>
          <option value="CODE_DESC">Sort: Code Z–A</option>
          <option value="NAME">Sort: Name</option>
          <option value="CREDITS">Sort: Credits</option>
        </select>

        <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">
          ▼
        </span>
      </div>

      {/* COURSE LIST (ONLY THIS SCROLLS) */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1.5">
          {filteredCourses.map(course => {
            const isActive = activeCourse === course.courseCode;
            return (
              <button
                key={course.courseCode}
                onClick={() =>
                  onSelect(isActive ? null : course.courseCode)
                }
                className={clsx(
                  "w-full rounded-xl px-4 py-3 text-left transition-all duration-300 relative overflow-hidden group border",
                  isActive
                    ? "border-transparent bg-gradient-to-r from-[var(--bg-accent)] to-[var(--bg-selected)] shadow-md text-white scale-[1.02]"
                    : "border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:shadow-sm text-[var(--text-primary)]"
                )}
              >
                {/* Subtle highlight overlay on active */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <div className="flex justify-between items-center mb-0.5">
                  <div className={clsx("font-semibold text-sm", isActive ? "text-white" : "text-[var(--text-primary)]")}>
                    {course.courseCode}
                  </div>
                  <div className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded-md", isActive ? "bg-black/20 text-white" : "bg-[var(--bg-muted)] text-[var(--text-muted)]")}>
                    {course.credits} CR
                  </div>
                </div>
                <div className={clsx("text-xs line-clamp-1", isActive ? "text-white/80" : "text-[var(--text-muted)]")}>
                  {course.courseTitle}
                </div>
              </button>
            )
          })}

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)] font-medium">
                No courses found
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
