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

/* ---------- ICS CONSTANTS ---------- */

const DAY_TO_ICS: Record<string, string> = {
  M: "MO",
  T: "TU",
  W: "WE",
  Th: "TH",
  F: "FR",
  S: "SA",
}

const SEM_START = [2026, 1, 5] // Classwork begins
const SEM_END_UTC = "20260425T235959Z"

/* ---------- UTILS ---------- */

const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export default function TimetableClient({ master }: { master: any[] }) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [courseSearch, setCourseSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const [mobileView, setMobileView] =
    useState<"TIMETABLE" | "COURSES" | "SECTIONS">("TIMETABLE")

  const [selectedSections, setSelectedSections] = useState<{
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }>({})

  /* ---------- EXPORT REF (DESKTOP GRID ALWAYS) ---------- */
  const desktopExportRef = useRef<HTMLDivElement>(null)

  /* ---------- TOAST ---------- */
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

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
      showToast("Timetable saved")
    } catch {
      showToast("Failed to save timetable")
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

  /* ---------- EXPORT PNG (MOBILE SAFE) ---------- */
  const exportPNG = async () => {
  if (!desktopExportRef.current) return

  const blob = await htmlToImage.toBlob(
    desktopExportRef.current,
    {
      pixelRatio: 2,
      backgroundColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--bg-surface"),
    }
  )

  if (!blob) {
    showToast("Failed to generate image")
    return
  }

  const blobUrl = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = blobUrl
  a.download = "timetable.png"
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // ⏳ delay revoke — CRITICAL on mobile
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)

  showToast("PNG ready — save from browser")
}




  /* ---------- EXPORT ICS ---------- */
  const exportICS = () => {
    const events: any[] = []

    sessions.forEach(s => {
      const byDay = DAY_TO_ICS[s.day]
      if (!byDay) return

      const [sh, sm] = s.startTime.split(":").map(Number)
      const [eh, em] = s.endTime.split(":").map(Number)

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
        showToast("ICS export failed")
        return
      }

      const blob = new Blob([value], {
        type: "text/calendar;charset=utf-8",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "timetable.ics"
      link.click()
      showToast("ICS exported")
    })
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[var(--bg-surface)] px-4 py-2 text-sm shadow">
          {toast}
        </div>
      )}

      {/* ================= MOBILE ================= */}
      <div className="md:hidden h-full flex flex-col">
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
            <button onClick={handleSave}>Save</button>
            <button onClick={exportPNG}>PNG</button>
            <button onClick={exportICS}>ICS</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
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
          <div className="flex justify-end gap-2 mb-4">
            <button onClick={handleSave}>Save</button>
            <button onClick={exportPNG}>Export PNG</button>
            <button onClick={exportICS}>Export ICS</button>
          </div>

          <div ref={desktopExportRef}>
            <TimetableGrid sessions={sessions} />
          </div>
        </main>
      </div>
    </div>
  )
}
