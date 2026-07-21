"use client"

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react"
import clsx from "clsx"

import CourseSidebar from "@/components/CourseSidebar"
import SectionSidebar from "@/components/SectionSidebar"
import TimetableGrid from "@/components/TimetableGrid"
import MobileTimetable from "@/components/MobileTimetable"

import { generateStudentTT } from "../../lib/timetable/generateStudentTT"
import { getCdcsForId, isYear1Batch, getYear1Cdcs, parseBitsId } from "@/lib/cdcHelper"

import { useRouter } from "next/navigation"

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect


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

export default function TimetableClient({ master, timetableId }: { master: any[], timetableId: string }) {
  const router = useRouter()
  const [activeCourse, setActiveCourse] = useState<string | null>(null)
  const [courseSearch, setCourseSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [cdcHighlights, setCdcHighlights] = useState<string[]>([])
  const [year1Group, setYear1Group] = useState<"group1" | "group2" | null>(null)
  
  const [localTimetable, setLocalTimetable] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const isYear1 = useMemo(() => isYear1Batch(localTimetable?.bitsId || ""), [localTimetable?.bitsId])
  const isBPharm = useMemo(() => {
     const parsed = parseBitsId(localTimetable?.bitsId || "")
     return parsed?.branches.some(b => b.branch === "Pharmacy") ?? false
  }, [localTimetable?.bitsId])

  useEffect(() => {
    if (localTimetable?.bitsId) {
      if (isYear1) {
        const masterCodes = new Set(master.map((c: any) => c.courseCode as string))
        setCdcHighlights(getYear1Cdcs(localTimetable.bitsId, masterCodes, year1Group ?? undefined))
      } else {
        const cdcs = getCdcsForId(localTimetable.bitsId)
        setCdcHighlights(cdcs.map((c: any) => c.code))
      }
    } else {
      setCdcHighlights([])
    }
  }, [localTimetable?.bitsId, isYear1, isBPharm, year1Group, master])

  const [mobileView, setMobileView] =
    useState<"TIMETABLE" | "COURSES" | "SECTIONS">("TIMETABLE")

  const [selectedSections, setSelectedSections] = useState<{
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }>({})

  // History for Undo/Redo
  const historyRef = useRef<{ list: any[], index: number }>({ list: [], index: -1 })
  const [historyKey, setHistoryKey] = useState(0)

  // Credit limits tracking
  const activeSelectedCourses = Object.keys(selectedSections).filter(courseCode => {
    const bucket = selectedSections[courseCode]
    return bucket && Object.values(bucket).some(val => val !== undefined && val !== null)
  })

  const addedCoursesCount = activeSelectedCourses.length
  const totalCredits = useMemo(() => {
    return activeSelectedCourses.reduce((sum, courseCode) => {
      const course = master.find(c => c.courseCode === courseCode)
      const credits = parseInt(course?.credits || "0", 10)
      return sum + (isNaN(credits) ? 0 : credits)
    }, 0)
  }, [activeSelectedCourses, master])

  const showLimitWarning = !isYear1 && (addedCoursesCount > 8 || totalCredits > 25)

  const creditBadge = addedCoursesCount > 0 && (
    <div className={clsx(
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-colors min-w-max w-fit",
      showLimitWarning 
        ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 shadow-sm"
        : "bg-[var(--bg-surface-hover)] text-[var(--text-muted)] border-[var(--border-subtle)]"
    )}>
      <span>{addedCoursesCount} {addedCoursesCount === 1 ? "Course" : "Courses"}</span>
      <span className="w-1 h-1 shrink-0 rounded-full bg-current opacity-50" />
      <span>{totalCredits} {totalCredits === 1 ? "Credit" : "Credits"}</span>
      {showLimitWarning && (
         <span className="ml-1 shrink-0" title="Max 8 courses and 25 credits allowed">⚠️ Over Limit</span>
      )}
    </div>
  )

  /* ---------- CONFLICT CHECKING ---------- */
  const savedSectionsRef = useRef<string>("{}")
  const hasUnsavedChanges = JSON.stringify(selectedSections) !== savedSectionsRef.current

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

  /* ---------- HISTORY HELPERS ---------- */
  const pushToHistory = (newSections: any) => {
    setSelectedSections(newSections)
    const { list, index } = historyRef.current
    const nextList = list.slice(0, index + 1)
    nextList.push(newSections)
    historyRef.current = { list: nextList, index: nextList.length - 1 }
    setHistoryKey(prev => prev + 1)
  }

  const handleUndo = () => {
    const { list, index } = historyRef.current
    if (index > 0) {
      historyRef.current.index = index - 1
      setSelectedSections(list[index - 1])
      setHistoryKey(prev => prev + 1)
    }
  }

  const handleRedo = () => {
    const { list, index } = historyRef.current
    if (index < list.length - 1) {
      historyRef.current.index = index + 1
      setSelectedSections(list[index + 1])
      setHistoryKey(prev => prev + 1)
    }
  }

  /* ---------- SECTION SELECT ---------- */
  const handleSectionSelect = (
    type: "LECTURE" | "TUTORIAL" | "PRACTICAL",
    section?: string
  ) => {
    if (!activeCourse) return

    const newSections = {
      ...selectedSections,
      [activeCourse]: {
        ...(selectedSections[activeCourse] || {}),
        [type]: section,
      },
    }
    pushToHistory(newSections)
  }

  /* ---------- REMOVE COURSE ---------- */
  const handleRemoveCourse = (courseCode: string) => {
    const next = { ...selectedSections }
    delete next[courseCode]
    pushToHistory(next)
    
    if (activeCourse === courseCode) {
      setActiveCourse(null)
      setMobileView("COURSES")
    }
  }

  /* ---------- CLEAR ALL ---------- */
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all selected courses?")) {
      pushToHistory({})
      setActiveCourse(null)
      setMobileView("COURSES")
    }
  }

  /* ---------- SAVE TIMETABLE ---------- */
  const handleSave = async () => {
    if (!localTimetable) return
    
    try {
      // 1. Save to local storage
      const stored = localStorage.getItem("student_timetables")
      if (stored) {
        const parsed = JSON.parse(stored)
        const updated = parsed.map((t: any) => {
          if (t.id === timetableId) {
            return { ...t, sections: selectedSections, updatedAt: Date.now() }
          }
          return t
        })
        localStorage.setItem("student_timetables", JSON.stringify(updated))
      }

      // 2. Always sync this draft to server
      const draftPayload = {
        id: timetableId,
        name: localTimetable.name,
        bitsId: localTimetable.bitsId,
        isActive: localTimetable.isActive,
        sections: selectedSections,
      }
      const res = await fetch("/api/timetable/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload),
      })
      if (!res.ok) throw new Error(await res.text())

      // 3. If active, also sync to legacy endpoint (for exams integration)
      if (localTimetable.isActive) {
        await fetch("/api/timetable/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedSections),
        })
      }

      savedSectionsRef.current = JSON.stringify(selectedSections)
      showToast("Timetable saved ✓")
    } catch {
      showToast("Failed to save timetable (server sync error)")
    }
  }

  const handleSetActive = async () => {
    if (!localTimetable) return
    
    try {
      const stored = localStorage.getItem("student_timetables")
      if (stored) {
        const parsed = JSON.parse(stored)
        const updated = parsed.map((t: any) => ({
          ...t,
          isActive: t.id === timetableId,
          sections: t.id === timetableId ? selectedSections : t.sections,
          updatedAt: t.id === timetableId ? Date.now() : t.updatedAt
        }))
        localStorage.setItem("student_timetables", JSON.stringify(updated))
        
        // Sync the new active to server
        const res = await fetch("/api/timetable/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedSections),
        })
        if (!res.ok) throw new Error(await res.text())
        
        setLocalTimetable({ ...localTimetable, isActive: true })
        savedSectionsRef.current = JSON.stringify(selectedSections)
        showToast("Set as Active & Synced ✓")
      }
    } catch {
      showToast("Failed to set active (server sync error)")
    }
  }

  /* ---------- LOAD SAVED TT ---------- */
  useIsomorphicLayoutEffect(() => {
    function loadSavedTT() {
      const stored = localStorage.getItem("student_timetables")
      if (stored) {
        const parsed = JSON.parse(stored)
        const current = parsed.find((t: any) => t.id === timetableId)
        if (current) {
          setLocalTimetable(current)
          
          if (current.bitsId) {
             // CDCs are now handled by the useEffect above
          }

          if (current.sections && Object.keys(current.sections).length > 0) {
            setSelectedSections(current.sections)
            historyRef.current = { list: [current.sections], index: 0 }
            setHistoryKey(prev => prev + 1)
            
            setActiveCourse(Object.keys(current.sections)[0] ?? null)
            savedSectionsRef.current = JSON.stringify(current.sections)
          } else {
            historyRef.current = { list: [{}], index: 0 }
            setHistoryKey(prev => prev + 1)
          }
        }
      }
      setIsHydrated(true)
    }

    loadSavedTT()
  }, [timetableId])

  /* ---------- BEFOREUNLOAD — warn on unsaved changes ---------- */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(selectedSections) !== savedSectionsRef.current) {
        e.preventDefault()
        e.returnValue = "You have unsaved timetable changes. Save before leaving?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [selectedSections])

  /* ---------- GENERATE SESSIONS ---------- */
  const sessions = generateStudentTT(master, selectedSections)

  useEffect(() => {
    if (typeof window !== "undefined" && sessions.length > 0) {
      localStorage.setItem("student_dashboard_sessions", JSON.stringify(sessions))
      
      // Dynamically load findClashes to avoid client-side circular issues
      import("../../lib/timetable/clashDetector").then(({ findClashes }) => {
        const clashes = findClashes(sessions as any)
        
        const stored = localStorage.getItem("student_timetables")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            let updated = false
            const newTimetables = parsed.map((t: any) => {
              if (t.id === timetableId) {
                updated = true
                return { ...t, clashes }
              }
              return t
            })
            if (updated) {
              localStorage.setItem("student_timetables", JSON.stringify(newTimetables))
              window.dispatchEvent(new Event("timetable-clashes-updated"))
            }
          } catch (e) {}
        }
      })
    }
  }, [sessions, timetableId])

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

      // Lazy-load html-to-image only when needed
      const htmlToImage = await import("html-to-image")

      const blob = await htmlToImage.toBlob(
        target,
        {
          pixelRatio: 2,
          backgroundColor: getComputedStyle(
            document.documentElement
          ).getPropertyValue("--bg-surface") || "#ffffff",
          fontEmbedCSS: '',
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

      // Lazy-load ics only when needed
      import("ics").then(({ createEvents }) => {
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
      }).catch((err: any) => showToast(`ICS Error: ${err.message || String(err)}`))
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

  /* Master course codes for CDC matching */
  const masterCodes = new Set(master.map((c: any) => c.courseCode as string))

  const actionButtonsDesktop = (
    <div id="tour-action-buttons-desktop" className="hidden md:flex flex-wrap items-center justify-end gap-2">
      {/* Undo/Redo */}
      <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm mr-1">
        <button
          onClick={handleUndo}
          disabled={historyRef.current.index <= 0}
          className="px-3 py-1.5 transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <div className="w-px h-5 bg-[var(--border-subtle)]" />
        <button
          onClick={handleRedo}
          disabled={historyRef.current.index >= historyRef.current.list.length - 1}
          className="px-3 py-1.5 transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)", color: "var(--text-primary)" }}>
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
      </div>

      <button 
        onClick={handleClearAll}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 shadow-sm hover:shadow active:scale-95"
      >
        <span className="xl:hidden">Clear</span>
        <span className="hidden xl:inline">Clear All</span>
      </button>

      <button 
        onClick={handleSave}
        className="relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all text-white shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-105 active:scale-95 hover:shadow-lg"
        style={{ backgroundColor: "var(--bg-accent)" }}
      >
        Save
        {/* Unsaved changes dot */}
        {hasUnsavedChanges && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-gray-900 shadow-sm" />
        )}
      </button>
      <button 
        onClick={exportPNG}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm hover:shadow active:scale-95"
      >
        <span className="xl:hidden">PNG</span>
        <span className="hidden xl:inline">Export PNG</span>
      </button>
      <button 
        onClick={exportICS}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] shadow-sm hover:shadow active:scale-95"
      >
        <span className="xl:hidden">ICS</span>
        <span className="hidden xl:inline">Export ICS</span>
      </button>
    </div>
  )

  const actionButtonsMobile = (
    <div id="tour-action-buttons-mobile" className="flex items-center gap-2 min-w-max">
      {/* Undo/Redo */}
      <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm mr-1">
        <button
          onClick={handleUndo}
          disabled={historyRef.current.index <= 0}
          className="px-3 py-1.5 transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <div className="w-px h-5 bg-[var(--border-subtle)]" />
        <button
          onClick={handleRedo}
          disabled={historyRef.current.index >= historyRef.current.list.length - 1}
          className="px-3 py-1.5 transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)", color: "var(--text-primary)" }}>
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
      </div>

      <button 
        onClick={handleClearAll}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 shadow-sm hover:shadow active:scale-95"
      >
        <span className="md:hidden">Clear</span>
        <span className="hidden md:inline">Clear All</span>
      </button>

      <button 
        onClick={handleSave}
        className="relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all text-white shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-105 active:scale-95 hover:shadow-lg"
        style={{ backgroundColor: "var(--bg-accent)" }}
      >
        Save
        {/* Unsaved changes dot */}
        {hasUnsavedChanges && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-gray-900 shadow-sm" />
        )}
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
    <div className="h-screen w-full overflow-hidden flex flex-col">
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileView === "TIMETABLE" && (
            <div className="flex flex-col h-full">
              <div className="p-2 border-b border-[var(--border-subtle)] flex flex-col gap-2">
                <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                  {creditBadge}
                </div>
                <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                  {actionButtonsMobile}
                </div>
              </div>
              <div id="tour-timetable-grid-mobile" className="flex-1 overflow-y-auto">
                <MobileTimetable sessions={sessions} />
              </div>
            </div>
          )}
          {mobileView === "COURSES" && (
            <CourseSidebar
              courses={master}
              activeCourse={activeCourse}
              onSelect={handleCourseSelect}
              search={courseSearch}
              setSearch={setCourseSearch}
              selectedSections={selectedSections}
              cdcHighlights={cdcHighlights}
              onClearCDC={() => setCdcHighlights([])}
              currentSessions={sessions}
              onRemoveCourse={handleRemoveCourse}
              year1Group={year1Group}
              setYear1Group={setYear1Group}
              isYear1={isYear1 && !isBPharm}
            />
          )}
          {mobileView === "SECTIONS" && activeCourse && (
            <SectionSidebar
              course={master.find(c => c.courseCode === activeCourse)}
              selected={selectedSections[activeCourse]}
              onSelect={handleSectionSelect}
              onBack={() => setMobileView("COURSES")}
              currentSessions={sessions}
            />
          )}
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="flex h-full max-md:fixed max-md:-top-[9999px] max-md:-left-[9999px] max-md:-z-50 max-md:w-[1200px] max-md:h-[800px] max-md:pointer-events-none max-md:overflow-hidden max-md:opacity-100">
        <CourseSidebar
          courses={master}
          activeCourse={activeCourse}
          onSelect={handleCourseSelect}
          search={courseSearch}
          setSearch={setCourseSearch}
          selectedSections={selectedSections}
          cdcHighlights={cdcHighlights}
          onClearCDC={() => setCdcHighlights([])}
          currentSessions={sessions}
          onRemoveCourse={handleRemoveCourse}
          isLoading={!isHydrated}
          year1Group={year1Group}
          setYear1Group={setYear1Group}
          isYear1={isYear1 && !isBPharm}
        />

        {activeCourse && (
          <SectionSidebar
            course={master.find(c => c.courseCode === activeCourse)}
            selected={selectedSections[activeCourse]}
            onSelect={handleSectionSelect}
            currentSessions={sessions}
          />
        )}

        <main className="flex-1 overflow-y-auto p-1.5 md:p-3 flex flex-col gap-2 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between px-1 gap-2">
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">My Timetable</h1>
              {creditBadge}
            </div>
            <div className="flex-1 flex justify-start lg:justify-end overflow-x-auto pb-1">
              {actionButtonsDesktop}
            </div>
          </div>
          <div id="tour-timetable-grid-desktop" ref={desktopExportRef} className="bg-[var(--bg-surface)] rounded-xl overflow-hidden shadow-sm border border-[var(--border-subtle)] w-full h-fit">
            <TimetableGrid sessions={sessions} />
          </div>
        </main>
      </div>
    </div>
  )
}
