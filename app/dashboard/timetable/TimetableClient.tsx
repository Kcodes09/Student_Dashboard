"use client"

import { useEffect, useState } from "react"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"

import MobileTimetable from "@/components/MobileTimetable"
import { generateStudentTT } from "../../lib/timetable/generateStudentTT"

export default function TimetableClient({ master }: { master: any[] }) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null)

  const [selectedSections, setSelectedSections] = useState<{
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }>({})

  /* ---------- COURSE ---------- */
  const handleCourseSelect = (courseCode: string | null) => {
    setActiveCourse(courseCode)
  }

  /* ---------- SECTIONS ---------- */
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

  /* ---------- ENSURE BUCKET ---------- */
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
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      {/* COURSE SIDEBAR */}
      <div className="md:block">
        <CourseSidebar
          courses={master}
          activeCourse={activeCourse}
          onSelect={handleCourseSelect}
        />
      </div>

      {/* SECTION SIDEBAR (Desktop only) */}
      {activeCourse && (
        <div className="hidden md:block">
          <SectionSidebar
            course={master.find(c => c.courseCode === activeCourse)}
            selected={selectedSections[activeCourse]}
            onSelect={handleSectionSelect}
          />
        </div>
      )}

      {/* TIMETABLE */}
      <main className="flex-1 overflow-hidden bg-[var(--bg-main)]">
        {/* MOBILE VIEW */}
        <div className="md:hidden">
          <MobileTimetable sessions={sessions} />
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block h-full p-4 overflow-auto">
          <TimetableGrid sessions={sessions} />
        </div>
      </main>
    </div>
  )
}
