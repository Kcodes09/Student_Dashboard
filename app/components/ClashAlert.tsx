"use client"

import { useEffect, useState } from "react"
import { ClashInfo } from "../lib/timetable/clashDetector"

export default function ClashAlert() {
  const [clashes, setClashes] = useState<ClashInfo[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Listen for the custom event or check localStorage manually
  const checkClashes = () => {
    const raw = localStorage.getItem("student_timetables")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        let target = parsed.find((t: any) => t.isActive)
        
        // If we are in the editor viewing a specific draft, show its clashes instead!
        if (typeof window !== "undefined" && window.location.pathname === "/dashboard/timetable") {
          const params = new URLSearchParams(window.location.search)
          const currentId = params.get("id")
          if (currentId) {
            const draft = parsed.find((t: any) => t.id === currentId)
            if (draft) target = draft
          }
        }
        
        if (target && target.clashes) {
          setClashes(target.clashes)
        } else {
          setClashes([])
        }
      } catch (err) {
        setClashes([])
      }
    } else {
      setClashes([])
    }
  }

  useEffect(() => {
    // Initial check
    checkClashes()

    // Listen for custom event from TimetableClient / Dashboard
    window.addEventListener("timetable-clashes-updated", checkClashes)
    
    // Also check on standard storage event if updated in another tab
    window.addEventListener("storage", checkClashes)
    
    return () => {
      window.removeEventListener("timetable-clashes-updated", checkClashes)
      window.removeEventListener("storage", checkClashes)
    }
  }, [])

  if (clashes.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all font-bold text-xs"
        title="Timetable Clashes Detected"
      >
        <span className="text-base leading-none">⚠️</span>
        <span className="hidden sm:inline">{clashes.length} Clash{clashes.length > 1 ? "es" : ""}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col p-6 border relative"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Timetable Clashes
              </h2>
            </div>
            
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              The following classes have overlapping times in your active timetable:
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
              {clashes.map((c, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "var(--bg-surface-hover)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-red-500">{c.day} • {c.timeStr}</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ color: "var(--text-primary)" }}>
                    <span className="font-semibold">{c.course1} ({c.section1})</span>
                    <span className="text-xs text-red-400 font-bold mx-2">VS</span>
                    <span className="font-semibold">{c.course2} ({c.section2})</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl font-bold transition-all text-white shadow-md active:scale-95"
              style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
