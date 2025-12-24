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
}


type SortType = "CODE_ASC" | "CODE_DESC" | "NAME" | "CREDITS"

export default function CourseSidebar({
  courses,
  activeCourse,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortType>("CODE_ASC")

  /* ---------------- SORT ---------------- */
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

  /* ---------------- SEARCH ---------------- */
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return sortedCourses

    const q = search.toLowerCase()

    return sortedCourses.filter(
      c =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q)
    )
  }, [sortedCourses, search])

  /* ---------------- RENDER ---------------- */
  return (

    <aside
  className="
    w-80
    shrink-0
    border-r
    bg-[var(--bg-surface)]
    flex flex-col h-screen
  "
>



      {/* HEADER */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-muted)]">
          Courses
        </h2>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search course code or name"
        className="
          mb-3 w-full rounded-md border
          bg-[var(--bg-input)]
          px-3 py-2 text-sm
          text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:ring-2
          focus:ring-[var(--bg-accent)]
        "
      />

      {/* SORT */}
      <div className="relative mb-4">
  <select
    value={sortBy}
    onChange={e => setSortBy(e.target.value as SortType)}
    className="
      w-full appearance-none
      rounded-lg border
      bg-[var(--bg-surface)]
      px-3 py-2 pr-8
      text-sm
      text-[var(--text-primary)]
      shadow-sm
      transition

      hover:bg-[var(--bg-surface-hover)]

      focus:outline-none
      focus:ring-2
      focus:ring-[var(--bg-accent)]
    "
  >
    <option value="CODE_ASC">Code A–Z</option>
    <option value="CODE_DESC">Code Z–A</option>
    <option value="NAME">Name</option>
    <option value="CREDITS">Credits</option>
  </select>

  {/* Chevron */}
  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
    ▾
  </span>
</div>


<div className="flex-1 overflow-y-auto pr-1 ">
      {/* COURSE LIST */}
      <div className="space-y-1">
        {filteredCourses.map(course => (
  <button
    key={course.courseCode}   // ✅ REQUIRED HERE
    onClick={() =>
      onSelect(
        activeCourse === course.courseCode
          ? null
          : course.courseCode
      )
    }
    className={clsx(
      "w-full rounded-lg px-3 py-2 text-left transition",
      "hover:bg-[var(--bg-surface-hover)]",
      activeCourse === course.courseCode &&
        "bg-[var(--bg-selected)] border border-[var(--bg-accent)]"
    )}
  >
    <div className="font-medium text-sm">
      {course.courseCode}
    </div>
    <div className="truncate text-xs text-[var(--text-muted)]">
      {course.courseTitle}
    </div>
  </button>
))}


        {filteredCourses.length === 0 && (
          <p className="text-xs text-[var(--text-muted)]">
            No courses found
          </p>
        )}
      </div>
      </div>
    </aside>
  )
}
