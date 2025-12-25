"use client"

import { useEffect, useRef, useState } from "react"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
import { generateStudentTT } from "../../lib/timetable/generateStudentTT"

export default function TimetableClient({ master }: { master: any[] }) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [showCourseSidebar, setShowCourseSidebar] = useState(false)

  const touchStartX = useRef<number | null>(null)

  const [selectedSections, setSelectedSections] = useState<{
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }>({})

  /* ---------- SWIPE HANDLERS ---------- */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const diff =
      e.changedTouches[0].clientX - touchStartX.current

    // 👉 Swipe right (open)
    if (diff > 80) {
      setShowCourseSidebar(true)
    }

    // 👈 Swipe left (close)
    if (diff < -80) {
      setShowCourseSidebar(false)
    }

    touchStartX.current = null
  }

  /* ---------- COURSE SELECT ---------- */
  const handleCourseSelect = (courseCode: string | null) => {
    setActiveCourse(courseCode)
    setShowCourseSidebar(false) // hide after selection
  }

  /* ---------- SECTION SELECT ---------- */
  const handleSectionSelect = (
    type: "LECTURE" | "TUTORIAL" | "PRACTICAL",
    section?: string
  ) => {
    if (!activeCourse) return

    setSelectedSections(prev => ({
      ...prev,
      [activeCourse]: {
        ...prev[activeCourse],
        [type]: section,
      },
    }))
  }

  useEffect(() => {
    if (!activeCourse) return
    if (!selectedSections[activeCourse]) {
      setSelectedSections(prev => ({
        ...prev,
        [activeCourse]: {},
      }))
    }
  }, [activeCourse])

  const sessions = generateStudentTT(master, selectedSections)

  return (
    <div
      className="h-screen w-full overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========== MOBILE ========== */}
      <div className="md:hidden h-full relative">
        {/* COURSE SIDEBAR (SLIDING) */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40
            w-80 bg-[var(--bg-surface)]
            transform transition-transform duration-300
            ${showCourseSidebar ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <CourseSidebar
            courses={master}
            activeCourse={activeCourse}
            onSelect={handleCourseSelect}
          />
        </div>

        {/* OVERLAY */}
        {showCourseSidebar && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setShowCourseSidebar(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <div className="h-full relative z-10">
          {activeCourse && (
            <SectionSidebar
              course={master.find(c => c.courseCode === activeCourse)}
              selected={selectedSections[activeCourse]}
              onSelect={handleSectionSelect}
            />
          )}

          <TimetableGrid sessions={sessions} />
        </div>
      </div>

      {/* ========== DESKTOP ========== */}
      <div className="hidden md:flex h-full">
        <CourseSidebar
          courses={master}
          activeCourse={activeCourse}
          onSelect={handleCourseSelect}
        />

        {activeCourse && (
          <SectionSidebar
            course={master.find(c => c.courseCode === activeCourse)}
            selected={selectedSections[activeCourse]}
            onSelect={handleSectionSelect}
          />
        )}

        <main className="flex-1 p-4 overflow-hidden">
          <TimetableGrid sessions={sessions} />
        </main>
      </div>
    </div>
  )
}
