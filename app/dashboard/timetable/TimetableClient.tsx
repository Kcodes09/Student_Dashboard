"use client"

import { useEffect, useState } from "react"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
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

  // Toggle course selection
  const handleCourseSelect = (courseCode: string | null) => {
  setActiveCourse(courseCode)
}


  // Handle section selection
  const handleSectionSelect = (
  type: "LECTURE" | "TUTORIAL" | "PRACTICAL",
  section?: string
) => {
  if (!activeCourse) return

  setSelectedSections(prev => {
    const courseSections = prev[activeCourse] ?? {}

    // DESELECT
    if (!section) {
      const { [type]: _, ...rest } = courseSections
      return {
        ...prev,
        [activeCourse]: rest,
      }
    }

    // SELECT
    return {
      ...prev,
      [activeCourse]: {
        ...courseSections,
        [type]: section,
      },
    }
  })
}


  // Ensure course has section bucket
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
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT: Courses */}
      <CourseSidebar
  courses={master}
  activeCourse={activeCourse}
  onSelect={handleCourseSelect}
/>



      {/* MIDDLE: Sections */}
      {activeCourse && (
        <SectionSidebar
          course={master.find(c => c.courseCode === activeCourse)}
          selected={selectedSections[activeCourse]}
          onSelect={handleSectionSelect}
        />
      )}

      {/* RIGHT: Timetable */}
      <main className="flex-1 p-6 overflow-auto">
        <TimetableGrid sessions={sessions} />
      </main>
    </div>
  )
}


