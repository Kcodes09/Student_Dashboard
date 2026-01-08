"use client"

import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import * as htmlToImage from "html-to-image"
import { createEvents } from "ics"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
import MobileTimetable from "@/components/MobileTimetable"

import { generateStudentTT } from "../../lib/timetable/generateStudentTT"

/* ---------- CONSTANTS ---------- */

// Map internal weekday to ICS weekday
const DAY_TO_ICS: Record<string, string> = {
  M: "MO",
  T: "TU",
  W: "WE",
  Th: "TH",
  F: "FR",
  S: "SA",
}

// Semester boundaries (Classwork begins → before Compre)
// You can later compute this dynamically from academic_calendar.json
const SEM_START = [2026, 1, 5]  // Jan 5, 2026
const SEM_END_UTC = "20260425T235959Z" // Apr 25, 2026 (UTC end of day)

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

  /* ---------- EXPORT REFS ---------- */
  const desktopExportRef = useRef<HTMLDivElement>(null)
  const mobileExportRef = useRef<HTMLDivElement>(null)

  /* ---------- COURSE SELECT ---------- */
  const handleCourseSelect = (courseCode: string | null) => {
    setActiveCourse(courseCode)
    if (courseCode) setMobileView("SECTIONS")
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

  /* ---------- ENSURE COURSE BUCKET ---------- */
  useEffect(() => {
    if (!activeCourse) return
    if (!selectedSections[activeCourse]) {
      setSelectedSections(prev => ({
        ...prev,
        [activeCourse]: {},
      }))
    }
  }, [activeCourse])

  /* ---------- SAVE TIMETABLE ---------- */
  const handleSave = async () => {
    try {
      const res = await fetch("/api/timetable/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSections),
      })

      if (!res.ok) throw new Error(await res.text())
      alert("Timetable saved successfully")
    } catch (err) {
      console.error("Save timetable failed:", err)
      alert("Failed to save timetable")
    }
  }

  /* ---------- LOAD SAVED TT ---------- */
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

  /* ---------- GENERATE SESSIONS ---------- */
  const sessions = generateStudentTT(master, selectedSections)

  /* ---------- EXPORT PNG ---------- */
  const exportPNG = async () => {
    const node =
      window.innerWidth < 768
        ? mobileExportRef.current
        : desktopExportRef.current

    if (!node) return

    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: 2,
      backgroundColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--bg-surface"),
    })

    const link = document.createElement("a")
    link.download = "timetable.png"
    link.href = dataUrl
    link.click()
  }

  /* ---------- EXPORT ICS (FIXED) ---------- */
  const exportICS = () => {
    const events: any[] = []

    sessions.forEach(s => {
      const [sh, sm] = s.startTime.split(":").map(Number)
      const [eh, em] = s.endTime.split(":").map(Number)

      const byDay = DAY_TO_ICS[s.day]
      if (!byDay) return

      events.push({
        title: `${s.courseCode} Class`,
        start: [...SEM_START, sh, sm],
        end: [...SEM_START, eh, em],

        location: s.room,
        description: `Section: ${s.section}`,

        recurrenceRule: `FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${SEM_END_UTC}`,
      })
    })

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error)
        alert("Failed to export ICS")
        return
      }

      const blob = new Blob([value], {
        type: "text/calendar;charset=utf-8",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "timetable.ics"
      link.click()
    })
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden h-full flex flex-col">
        {/* TOP BAR */}
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
              "text-sm font-semibold",
              mobileView === "TIMETABLE"
                ? "text-[var(--bg-accent)]"
                : "text-[var(--text-muted)]"
            )}
          >
            Timetable
          </button>

          <div className="flex gap-2">
            <button
              onClick={exportPNG}
              className="text-sm text-[var(--text-accent)]"
            >
              PNG
            </button>
            <button
              onClick={exportICS}
              className="text-sm text-[var(--text-accent)]"
            >
              ICS
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">
          {mobileView === "TIMETABLE" && (
            <div ref={mobileExportRef}>
              <MobileTimetable sessions={sessions} />
            </div>
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

        <div className="p-3 border-t">
          <button
            onClick={handleSave}
            className="w-full rounded-md bg-[var(--bg-accent)] py-2 text-white"
          >
            Save Timetable
          </button>
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
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={handleSave}
              className="rounded-md bg-[var(--bg-accent)] px-4 py-2 text-sm text-white"
            >
              Save Timetable
            </button>

            <button
              onClick={exportPNG}
              className="rounded-md bg-[var(--bg-muted)] px-4 py-2 text-sm"
            >
              Export PNG
            </button>

            <button
              onClick={exportICS}
              className="rounded-md bg-[var(--bg-muted)] px-4 py-2 text-sm"
            >
              Export ICS
            </button>
          </div>

          <div ref={desktopExportRef}>
            <TimetableGrid sessions={sessions} />
          </div>
        </main>
      </div>
    </div>
  )
}
