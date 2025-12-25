"use client"

import { useEffect, useState } from "react"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"

import MobileTimetable from "@/components/MobileTimetable"
import { generateStudentTT } from "../../lib/timetable/generateStudentTT"

export default function TimetableClient({ master }: { master: any[] }) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [showCourses, setShowCourses] = useState(true)

  const [mobileView, setMobileView] =
  useState<"COURSES" | "SECTIONS">("COURSES")

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
  setShowCourses(false) // hide course list on mobile


  // 📱 On mobile, open section sidebar full screen
  if (courseCode) {
    setMobileView("SECTIONS")
  }
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
  <div className="h-dvh w-full overflow-hidden">  
    {/* ---------- MOBILE ---------- */}
    <div className="md:hidden h-full overflow-hidden">
      {mobileView === "COURSES" && (
        <CourseSidebar
          courses={master}
          activeCourse={activeCourse}
          onSelect={handleCourseSelect}
        />
      )}

      {mobileView === "SECTIONS" && activeCourse && (
        

        <SectionSidebar
          course={master.find(c => c.courseCode === activeCourse)}
          selected={selectedSections[activeCourse]}
          onSelect={handleSectionSelect}
          onBack={() => setMobileView("COURSES")}   // 👈 NEW
        />

      )}
    </div>

    {/* ---------- DESKTOP ---------- */}
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

      <main className="flex-1 p-6 overflow-hidden">
        <TimetableGrid sessions={sessions} />
      </main>
    </div>
  </div>
)

}
