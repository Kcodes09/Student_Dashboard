"use client"

import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import { createPortal } from "react-dom"
import { createEvents } from "ics"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
import MobileTimetable from "@/components/MobileTimetable"

import { generateStudentTT } from "../../lib/timetable/generateStudentTT"
import * as htmlToImage from "html-to-image"

/* ---------- ICS CONSTANTS ---------- */

const DAY_TO_ICS: Record<string, string> = {
  M: "MO",
  T: "TU",
  W: "WE",
  Th: "TH",
  F: "FR",
  S: "SA",
}

const SEM_START = [2026, 8, 1] // Classwork begins Aug 1
const SEM_END_UTC = "20261231T235959Z" // End of Dec

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

  useEffect(() => {
    if (typeof window !== "undefined" && sessions.length > 0) {
      localStorage.setItem("student_dashboard_sessions", JSON.stringify(sessions))
    }
  }, [sessions])

  /* ---------- EXPORT PNG (MOBILE SAFE) ---------- */
  const exportPNG = async () => {
    try {
      if (!desktopExportRef.current) {
        showToast("Export ref is null")
        return
      }

      showToast("Generating PNG...")

      const target = desktopExportRef.current
      
      // Save original styles
      const originalOverflow = target.style.overflow
      const originalWidth = target.style.width
      const originalHeight = target.style.height
      
      // Force full size for export
      target.style.overflow = "visible"
      target.style.width = "max-content"
      target.style.height = "max-content"

      // Also force inner grid container to not scroll
      const innerGrid = target.querySelector('.overflow-x-auto') as HTMLElement
      let originalInnerOverflow = ""
      if (innerGrid) {
         originalInnerOverflow = innerGrid.style.overflow
         innerGrid.style.overflow = "visible"
      }

      // Small delay to allow browser to apply styles before capturing
      await new Promise(r => setTimeout(r, 100))

      const blob = await htmlToImage.toBlob(
        target,
        {
          pixelRatio: 2,
          backgroundColor: getComputedStyle(
            document.documentElement
          ).getPropertyValue("--bg-surface") || "#ffffff",
        }
      )

      // Restore styles
      target.style.overflow = originalOverflow
      target.style.width = originalWidth
      target.style.height = originalHeight
      if (innerGrid) {
          innerGrid.style.overflow = originalInnerOverflow
      }

      if (!blob) {
        showToast("Failed to generate image (null blob)")
        return
      }

      // For mobile: Try to use Web Share API if possible
      if (isMobile() && navigator.share && navigator.canShare) {
        const file = new File([blob], "timetable.png", { type: "image/png" })
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "My Timetable",
              files: [file]
            })
            return
          } catch (err: any) {
            if (err.name !== "AbortError") {
              console.error("Share failed", err)
            }
          }
        }
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
    } catch (err: any) {
      showToast(`PNG Error: ${err.message || String(err)}`)
      
      // Ensure styles are restored on error
      if (desktopExportRef.current) {
         desktopExportRef.current.style.overflow = ""
         desktopExportRef.current.style.width = ""
         desktopExportRef.current.style.height = ""
         const innerGrid = desktopExportRef.current.querySelector('.overflow-x-auto') as HTMLElement
         if (innerGrid) innerGrid.style.overflow = ""
      }
    }
  }




  /* ---------- EXPORT ICS ---------- */
  const exportICS = () => {
    try {
      const events: any[] = []

      sessions.forEach(s => {
        const byDay = DAY_TO_ICS[s.day]
        if (!byDay) return

        const [sh, sm] = s.startTime.split(":").map(Number)
        const [eh, em] = s.endTime.split(":").map(Number)

        if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return

        events.push({
          title: `${s.courseCode} Class`,
          start: [...SEM_START, sh, sm],
          end: [...SEM_START, eh, em],
          location: s.room,
          description: `Section: ${s.section}`,
          recurrenceRule: `FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${SEM_END_UTC}`,
        })
      })
      
      if (events.length === 0) {
          showToast("No classes selected to export.")
          return
      }

      // Use synchronous call so that Safari doesn't block the download
      const { error, value } = createEvents(events)
      
      if (error) {
        showToast(`ICS Error: ${error.message || String(error)}`)
        return
      }
      if (!value) {
        showToast("ICS value is empty")
        return
      }

      const blob = new Blob([value], {
        type: "text/calendar;charset=utf-8",
      })

      // Try web share first on mobile
      if (isMobile() && navigator.share && navigator.canShare) {
        const file = new File([blob], "timetable.ics", { type: "text/calendar" })
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            title: "Timetable Calendar",
            files: [file]
          }).then(() => {
              showToast("ICS Shared")
          }).catch((err) => {
              if (err.name !== "AbortError") {
                 showToast("Share failed, trying download...")
                 downloadFile(blob, "timetable.ics")
              }
          })
          return
        }
      }

      downloadFile(blob, "timetable.ics")
      showToast("ICS exported")
    } catch (err: any) {
      showToast(`ICS Try/Catch: ${err.message || String(err)}`)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  }

  /* ---------- PORTAL FOR NAVBAR ACTIONS ---------- */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const portalNode = typeof document !== "undefined" ? document.getElementById("navbar-actions-portal") : null

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleSave}
        className="px-4 py-1.5 text-xs font-bold rounded-lg transition-all text-white shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-105 active:scale-95 hover:shadow-lg"
        style={{ backgroundColor: "var(--bg-accent)" }}
      >
        Save
      </button>
      <button 
        onClick={exportPNG}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm hover:shadow active:scale-95"
      >
        <span className="md:hidden">PNG</span>
        <span className="hidden md:inline">Export PNG</span>
      </button>
      <button 
        onClick={exportICS}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm hover:shadow active:scale-95"
      >
        <span className="md:hidden">ICS</span>
        <span className="hidden md:inline">Export ICS</span>
      </button>
    </div>
  )

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* RENDER ACTIONS TO NAVBAR */}
      {mounted && portalNode && createPortal(actionButtons, portalNode)}

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
      <div className="flex h-full max-md:fixed max-md:top-0 max-md:left-0 max-md:-z-50 max-md:w-[1200px] max-md:h-[800px] max-md:pointer-events-none max-md:overflow-hidden max-md:opacity-100">
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

        <main className="flex-1 overflow-auto p-1.5 md:p-3">
          <div ref={desktopExportRef} className="bg-[var(--bg-surface)] rounded-xl overflow-hidden shadow-sm border border-[var(--border-subtle)] w-full h-fit">
            <TimetableGrid sessions={sessions} />
          </div>
        </main>
      </div>
    </div>
  )
}
