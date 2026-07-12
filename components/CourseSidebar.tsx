"use client"

import { useMemo, useState } from "react"
import clsx from "clsx"

type Course = {
  courseCode: string
  courseTitle: string
  credits: number
  sections?: any[]
}

type SelectedCourseSections = {
  LECTURE?: string
  TUTORIAL?: string
  PRACTICAL?: string
  [key: string]: string | undefined
}

type Props = {
  courses: Course[]
  activeCourse: string | null
  onSelect: (code: string | null) => void

  search: string
  setSearch: (v: string) => void
  selectedSections?: Record<string, SelectedCourseSections>
}

type SortType = "CODE_ASC" | "CODE_DESC" | "NAME" | "CREDITS"

export default function CourseSidebar({
  courses,
  activeCourse,
  onSelect, 
  search="", 
  setSearch,
  selectedSections
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

  /* ---------- SPLIT SELECTED vs AVAILABLE ---------- */
  const selectedList = useMemo(() => {
    if (!selectedSections) return []
    return filteredCourses.filter(c => selectedSections[c.courseCode] && Object.keys(selectedSections[c.courseCode]).length > 0)
  }, [filteredCourses, selectedSections])

  const availableList = useMemo(() => {
    if (!selectedSections) return filteredCourses
    return filteredCourses.filter(c => !selectedSections[c.courseCode] || Object.keys(selectedSections[c.courseCode]).length === 0)
  }, [filteredCourses, selectedSections])

  /* ---------- HELPER ---------- */
  const getMissingComponents = (course: Course) => {
    if (!selectedSections || !selectedSections[course.courseCode] || !course.sections) return []
    
    // Find required components from master
    const availableTypes = new Set<string>()
    course.sections.forEach(s => {
      if (s.type) availableTypes.add(s.type.toUpperCase())
    })
    
    // Check what the user has selected
    const userSelected = selectedSections[course.courseCode]
    const selectedTypes = new Set<string>()
    Object.keys(userSelected).forEach(key => {
      if (userSelected[key]) selectedTypes.add(key.toUpperCase())
    })
    
    // Find missing
    const missing: string[] = []
    availableTypes.forEach(type => {
      if (!selectedTypes.has(type)) {
        if (type === 'LECTURE') missing.push('Lecture')
        else if (type === 'TUTORIAL') missing.push('Tutorial')
        else if (type === 'PRACTICAL') missing.push('Practical')
        else missing.push(type)
      }
    })
    
    return missing
  }

  // Component to render a course button
  const CourseButton = ({ course, isSelectedList }: { course: Course, isSelectedList: boolean }) => {
    const isActive = activeCourse === course.courseCode;
    const missing = isSelectedList ? getMissingComponents(course) : [];
    const hasWarning = missing.length > 0;

    return (
      <button
        onClick={() => onSelect(isActive ? null : course.courseCode)}
        className={clsx(
          "w-full rounded-xl px-4 py-3 text-left transition-all duration-300 relative overflow-hidden group border",
          isActive
            ? "border-transparent bg-gradient-to-r from-[var(--bg-accent)] to-[var(--bg-selected)] shadow-md text-white scale-[1.02]"
            : hasWarning
              ? "border-red-300 bg-red-50 dark:bg-red-900/10 hover:shadow-sm"
              : "border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:shadow-sm text-[var(--text-primary)]"
        )}
      >
        {/* Subtle highlight overlay on active */}
        {isActive && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <div className="flex justify-between items-center mb-0.5">
          <div className={clsx(
            "font-semibold text-sm", 
            isActive ? "text-white" : hasWarning ? "text-red-700 dark:text-red-400" : "text-[var(--text-primary)]"
          )}>
            {course.courseCode}
          </div>
          <div className={clsx(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
            isActive ? "bg-black/20 text-white" : hasWarning ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
          )}>
            {course.credits} CR
          </div>
        </div>
        
        <div className={clsx("text-xs line-clamp-1", isActive ? "text-white/80" : hasWarning ? "text-red-600/80 dark:text-red-400/80" : "text-[var(--text-muted)]")}>
          {course.courseTitle}
        </div>

        {hasWarning && (
          <div className="mt-2 flex items-start gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Missing: {missing.join(", ")}</span>
          </div>
        )}
      </button>
    )
  }

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
        
        {/* SELECTED COURSES SECTION */}
        {selectedList.length > 0 && (
          <div className="mb-6">
            <h3 className="px-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Added to Timetable
            </h3>
            <div className="space-y-1.5">
              {selectedList.map(course => (
                <CourseButton key={course.courseCode} course={course} isSelectedList={true} />
              ))}
            </div>
          </div>
        )}

        {/* AVAILABLE COURSES SECTION */}
        <div>
          {selectedList.length > 0 && availableList.length > 0 && (
            <h3 className="px-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 mt-4">
              Available Courses
            </h3>
          )}
          
          <div className="space-y-1.5">
            {availableList.map(course => (
              <CourseButton key={course.courseCode} course={course} isSelectedList={false} />
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-muted)] font-medium">
              No courses found
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
