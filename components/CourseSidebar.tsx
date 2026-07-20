"use client"

import { useMemo, useState, useEffect } from "react"
import clsx from "clsx"
import { checkCourseClash, getCDCClashes, ClashSession } from "@/app/lib/timetable/clashDetector"

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
  cdcHighlights?: string[]
  onClearCDC?: () => void
  currentSessions?: ClashSession[]
  onRemoveCourse?: (courseCode: string) => void
  isLoading?: boolean
}

type SortType = "CODE_ASC" | "CODE_DESC" | "NAME" | "CREDITS"

export default function CourseSidebar({
  courses,
  activeCourse,
  onSelect, 
  search="", 
  setSearch,
  selectedSections,
  cdcHighlights = [],
  onClearCDC,
  currentSessions = [],
  onRemoveCourse,
  isLoading = false,
}: Props) {
  
  const [sortBy, setSortBy] = useState<SortType>("CODE_ASC")
  const [viewMode, setViewMode] = useState<"OTHER" | "CDC">("CDC")
  const [visibleLimit, setVisibleLimit] = useState(50)

  useEffect(() => {
    setVisibleLimit(50)
  }, [search, viewMode])

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

  /* ---------- SEARCH & FILTER ---------- */
  const filteredCourses = useMemo(() => {
    let result = sortedCourses

    if (cdcHighlights.length > 0) {
      const cdcSet = new Set(cdcHighlights)
      if (viewMode === "CDC") {
        result = result.filter(c => cdcSet.has(c.courseCode))
      } else if (viewMode === "OTHER") {
        result = result.filter(c => !cdcSet.has(c.courseCode))
      }
    }

    if (!search.trim()) return result
    const q = search.toLowerCase()

    return result.filter(
      c =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q)
    )
  }, [sortedCourses, search, viewMode, cdcHighlights])

  /* ---------- HELPERS ---------- */

  /**
   * A course is considered "really selected" only if the user has chosen
   * at least one section type (L/T/P) with an actual value.
   */
  const hasAnySelection = (courseCode: string) => {
    if (!selectedSections) return false
    const bucket = selectedSections[courseCode]
    if (!bucket) return false
    return Object.values(bucket).some(v => !!v)
  }

  /* ---------- SPLIT SELECTED vs AVAILABLE ---------- */
  const selectedList = useMemo(() => {
    if (!selectedSections) return []
    // Only treat as selected if at least one L/P/T has a real value
    return filteredCourses.filter(c => hasAnySelection(c.courseCode))
  }, [filteredCourses, selectedSections])

  const availableList = useMemo(() => {
    return filteredCourses.filter(c => !hasAnySelection(c.courseCode))
  }, [filteredCourses, selectedSections])

  const displayedAvailable = availableList.slice(0, visibleLimit)

  /**
   * Returns missing section types for a course that has at least one selection.
   * If NOTHING is selected for the course, returns [] (not an error — not started).
   * Only flags an error if the user has picked some but not all required types.
   */
  const getMissingComponents = (course: Course) => {
    if (!selectedSections || !course.sections) return []
    const bucket = selectedSections[course.courseCode]
    if (!bucket) return []

    // What types does this course offer?
    const availableTypes = new Set<string>()
    course.sections.forEach(s => {
      if (s.type) availableTypes.add(s.type.toUpperCase())
    })

    // What has the user actually chosen (with a real value)?
    const selectedTypes = new Set<string>()
    Object.entries(bucket).forEach(([key, val]) => {
      if (val) selectedTypes.add(key.toUpperCase())
    })

    // If NOTHING is chosen at all — not an error, just not started
    if (selectedTypes.size === 0) return []

    // If something is chosen, flag whatever is still missing
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

  /** Course is fully configured (all required types chosen) */
  const isComplete = (course: Course) => {
    return hasAnySelection(course.courseCode) && getMissingComponents(course).length === 0
  }

  // Pre-calculate CDC courses to check against
  const cdcCourseObjects = useMemo(() => {
    return courses.filter(c => cdcHighlights.includes(c.courseCode))
  }, [courses, cdcHighlights])

  const cdcClashMap = useMemo(() => {
    const map: Record<string, { definite: string[], possible: string[] }> = {}
    if (cdcCourseObjects.length === 0) return map
    
    // Compute once for all courses
    for (const c of courses) {
      map[c.courseCode] = getCDCClashes(c, cdcCourseObjects)
    }
    return map
  }, [courses, cdcCourseObjects])

  const courseClashMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    if (!currentSessions || currentSessions.length === 0) return map

    for (const c of courses) {
      map[c.courseCode] = checkCourseClash(c, currentSessions)
    }
    return map
  }, [courses, currentSessions])

  // Component to render a course button
  const CourseButton = ({ course, isSelectedList, isCDC = false }: { course: Course, isSelectedList: boolean, isCDC?: boolean }) => {
    const isActive = activeCourse === course.courseCode
    const missing = isSelectedList ? getMissingComponents(course) : []
    const hasWarning = missing.length > 0
    const complete = isSelectedList && isComplete(course)
    const isClashing = !isSelectedList && !!courseClashMap[course.courseCode]

    // Check CDC clashes only for non-CDC courses (or even CDCs vs other CDCs) if not already selected
    const cdcClashes = (!isSelectedList && cdcClashMap[course.courseCode]) ? cdcClashMap[course.courseCode] : { definite: [], possible: [] }
    const hasDefiniteCDCClash = cdcClashes.definite.length > 0
    const hasPossibleCDCClash = cdcClashes.possible.length > 0

    return (
      <button
        onClick={() => onSelect(isActive ? null : course.courseCode)}
        className={clsx(
          "w-full rounded-xl px-4 py-3 text-left transition-all duration-300 relative overflow-hidden group border",
          isActive
            ? "border-transparent bg-gradient-to-r from-[var(--bg-accent)] to-[var(--bg-selected)] shadow-md text-white scale-[1.02]"
            : (isClashing || hasDefiniteCDCClash)
              ? "border-red-300 bg-red-50 dark:bg-red-900/10 hover:shadow-sm"
              : hasWarning || hasPossibleCDCClash
                ? "border-orange-300 bg-orange-50 dark:bg-orange-900/10 hover:shadow-sm"
                : complete
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/15 hover:shadow-sm"
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
            isActive ? "text-white"
              : (isClashing || hasDefiniteCDCClash) ? "text-red-700 dark:text-red-400"
              : (hasWarning || hasPossibleCDCClash) ? "text-orange-700 dark:text-orange-400"
              : complete ? "text-emerald-700 dark:text-emerald-400"
              : "text-[var(--text-primary)]"
          )}>
            {course.courseCode}
          </div>

          <div className="flex items-center gap-1.5">
            {/* CDC badge */}
            {isCDC && !isActive && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "rgb(99,102,241)" }}>
                CDC
              </span>
            )}
            {/* Remove Course Button */}
            {isSelectedList && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveCourse?.(course.courseCode)
                }}
                className={clsx(
                  "flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer",
                  isActive ? "text-white" : "text-[var(--text-muted)] hover:text-red-500"
                )}
                title="Remove course"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            )}
            {/* Status icon for selected courses */}
            {!isActive && complete && !isSelectedList && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-black shadow-sm">
                ✓
              </span>
            )}
            {!isActive && hasWarning && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-[9px] text-white font-black shadow-sm">
                !
              </span>
            )}
            {!isActive && (isClashing || hasDefiniteCDCClash) && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-[9px] text-white font-black shadow-sm" title="Course has unavoidable clashes">
                !
              </span>
            )}
            {!isActive && !isClashing && !hasDefiniteCDCClash && hasPossibleCDCClash && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-[9px] text-white font-black shadow-sm" title="Course has possible clash with CDC">
                !
              </span>
            )}
            <div className={clsx(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              isActive ? "bg-black/20 text-white"
                : (isClashing || hasDefiniteCDCClash) ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                : (hasWarning || hasPossibleCDCClash) ? "bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                : complete ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
            )}>
              {course.credits} CR
            </div>
          </div>
        </div>

        <div className={clsx(
          "text-xs line-clamp-1",
          isActive ? "text-white/80"
            : (isClashing || hasDefiniteCDCClash) ? "text-red-600/80 dark:text-red-400/80"
            : (hasWarning || hasPossibleCDCClash) ? "text-orange-600/80 dark:text-orange-400/80"
            : complete ? "text-emerald-600/80 dark:text-emerald-400/80"
            : "text-[var(--text-muted)]"
        )}>
          {course.courseTitle}
        </div>

        {/* Warning: clash with current sessions */}
        {isClashing && (
          <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1.5 rounded-lg">
            <span>Has unavoidable clashes</span>
          </div>
        )}

        {/* Warning: Definite CDC Clash */}
        {!isClashing && hasDefiniteCDCClash && (
          <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1.5 rounded-lg">
            <span>Definite clash with CDC: {cdcClashes.definite.join(", ")}</span>
          </div>
        )}

        {/* Warning: Possible CDC Clash */}
        {!isClashing && !hasDefiniteCDCClash && hasPossibleCDCClash && (
          <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1.5 rounded-lg">
            <span>Possible clash with CDC: {cdcClashes.possible.join(", ")}</span>
          </div>
        )}

        {/* Warning: partial selection — missing some types */}
        {hasWarning && (
          <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Missing: {missing.join(", ")}</span>
          </div>
        )}

        {/* Complete: all required types chosen */}
        {!isActive && complete && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All sections selected
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
      <div id="tour-search-bar" className="px-4 shrink-0">
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search course code or name"
            className="
              mb-3 w-full rounded-xl border border-[var(--border-subtle)]
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

      {/* VIEW TOGGLE */}
      {!isLoading && cdcHighlights.length > 0 && (
        <div id="tour-cdc-toggle" className="px-4 mb-4 shrink-0">
          <div className="flex bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("OTHER")}
              className={clsx(
                "flex-1 text-xs font-semibold py-1.5 rounded-md transition-all",
                viewMode === "OTHER" 
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              Other Courses
            </button>
            <button
              onClick={() => setViewMode("CDC")}
              className={clsx(
                "flex-1 text-xs font-semibold py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5",
                viewMode === "CDC" 
                  ? "bg-[var(--bg-accent)] text-white shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <span>My CDCs</span>
              <span className="h-4 w-4 rounded-full text-[9px] font-black text-white flex items-center justify-center bg-black/20">
                {cdcHighlights.length}
              </span>
            </button>
          </div>
        </div>
      )}

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
      <div id="tour-course-list" className="flex-1 overflow-y-auto px-3 pb-4 scroll-smooth">
        {isLoading ? (
          <div className="space-y-3 p-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full h-[68px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* CDC HIGHLIGHT SECTION — pinned at top when Smart Fill is active */}
            {cdcHighlights.length > 0 && viewMode === "CDC" && (() => {
              const cdcCourses = courses.filter(c => cdcHighlights.includes(c.courseCode))
          if (cdcCourses.length === 0) return null
          return (
            <div className="mb-5">
              <div
                className="flex items-center gap-2 px-2 py-2 rounded-xl mb-2"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.05))", borderLeft: "3px solid rgb(99,102,241)" }}
              >
                <span className="text-sm">🎓</span>
                <div>
                  <h3 className="text-xs font-bold" style={{ color: "rgb(99,102,241)" }}>Your CDCs</h3>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{cdcCourses.length} compulsory courses</p>
                </div>
              </div>
            </div>
          )
        })()}

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
            {displayedAvailable.map(course => (
              <CourseButton key={course.courseCode} course={course} isSelectedList={false} />
            ))}
          </div>

          {availableList.length > visibleLimit && (
            <button
              onClick={() => setVisibleLimit(v => v + 50)}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            >
              Load More Courses ({availableList.length - visibleLimit} remaining)
            </button>
          )}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-muted)] font-medium">
              No courses found
            </p>
          </div>
        )}
      </>
        )}
      </div>
    </aside>
  )
}
