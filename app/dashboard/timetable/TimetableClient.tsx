"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
import MobileTimetable from "@/components/MobileTimetable"

import { generateStudentTT } from "../../lib/timetable/generateStudentTT"

export default function TimetableClient({ master }: { master: any[] }) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [courseSearch, setCourseSearch] = useState("")

  const [mobileView, setMobileView] =
    useState<"TIMETABLE" | "COURSES" | "SECTIONS">("TIMETABLE")

  const [selectedSections, setSelectedSections] = useState<{
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }>({})

  /* ---------- COURSE SELECT ---------- */
  const handleCourseSelect = (courseCode: string | null) => {
    setActiveCourse(courseCode)

    if (courseCode) {
      setMobileView("SECTIONS")
    }
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
  
const handleSave = async () => {
  try {
    const res = await fetch("/api/timetable/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedSections),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }

    alert("Timetable saved successfully")
  } catch (err) {
    console.error("Save timetable failed:", err)
    alert("Failed to save timetable. Please try again.")
  }
}

useEffect(() => {
  async function loadSavedTT() {
    const res = await fetch("/api/timetable/load")
    const saved = await res.json()

    if (saved && Object.keys(saved).length > 0) {
      setSelectedSections(saved)
      setActiveCourse(Object.keys(saved)[0] ?? null)
    }
  }

  loadSavedTT()
}, [])





  const sessions = generateStudentTT(master, selectedSections)

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden h-full relative">
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-[var(--bg-surface)]">
  <button
    onClick={() => setMobileView("COURSES")}
    className={clsx(
      "text-sm font-semibold",
      mobileView === "COURSES"
        ? "text-[var(--bg-accent)]"
        : "text-[var(--text-muted)]"
    )}
  >
    Courses
  </button>

  <button
    onClick={() => setMobileView("TIMETABLE")}
    className={clsx(
      "text-sm px-6 font-semibold",
      mobileView === "TIMETABLE"
        ? "text-[var(--bg-accent)]"
        : "text-[var(--text-muted)]"
    )}
  >
    Timetable
  </button>
  <div className="hidden md:flex justify-end p-4">
  <button
    onClick={handleSave}
    className="rounded-md bg-[var(--bg-accent)] px-4 py-2 text-sm text-white hover:opacity-90"
  >
    Save Timetable
  </button>
</div>


</div>


          
        </div>

        {/* MOBILE CONTENT */}
        <div className="h-[calc(100%-48px)]">
          {mobileView === "TIMETABLE" && (
            <MobileTimetable sessions={sessions} />
          )}

          {mobileView === "COURSES" && (
            <CourseSidebar
  courses={master}
  activeCourse={activeCourse}
  onSelect={handleCourseSelect}
  search={courseSearch}
  setSearch={setCourseSearch}
/>

          )}

          {mobileView === "SECTIONS" && activeCourse && (
            <SectionSidebar
              course={master.find(c => c.courseCode === activeCourse)}
              selected={selectedSections[activeCourse]}
              onSelect={handleSectionSelect}
              onBack={() => setMobileView("COURSES")}
            />
          )}
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex h-full">
        <CourseSidebar
  courses={master}
  activeCourse={activeCourse}
  onSelect={handleCourseSelect}
  search={courseSearch}
  setSearch={setCourseSearch}
/>


        {activeCourse && (
          <SectionSidebar
            course={master.find(c => c.courseCode === activeCourse)}
            selected={selectedSections[activeCourse]}
            onSelect={handleSectionSelect}
          />
        )}

        <main className="flex-1 p-6 overflow-hidden">
          <div className="hidden md:flex justify-end p-4">
  <button
    onClick={handleSave}
    className="rounded-md bg-[var(--bg-accent)] px-4 py-2 text-sm text-white hover:opacity-90"
  >
    Save Timetable
  </button>
</div>


          <TimetableGrid sessions={sessions} />
        </main>
      </div>
    </div>
  )
}
