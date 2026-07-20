"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import master from "@/data/mastertt.json"

// Types
export interface LocalTimetable {
  id: string
  name: string
  bitsId: string // Used to determine branches for CDCs
  isActive: boolean
  sections: any // The selected sections object
  updatedAt: number
}

// Branch Options for the Modal
const BE_BRANCHES = [
  { code: "A1", label: "Chemical Engineering (A1)" },
  { code: "A2", label: "Civil Engineering (A2)" },
  { code: "A3", label: "Electrical & Electronics Engineering (A3)" },
  { code: "A4", label: "Mechanical Engineering (A4)" },
  { code: "A5", label: "B.Pharm (A5)" },
  { code: "A7", label: "Computer Science & Engineering (A7)" },
  { code: "A8", label: "Electronics & Instrumentation Engineering (A8)" },
  { code: "A9", label: "Biotechnology (A9)" },
  { code: "AA", label: "Electronics & Communication Engineering (AA)" },
  { code: "AB", label: "Manufacturing Engineering (AB)" },
  { code: "AC", label: "Electronics & Computer Engineering (AC)" },
  { code: "AD", label: "Mathematics and Computing (AD)" },
  { code: "AE", label: "Architectural and Urban Engineering (AE)" },
  { code: "AF", label: "Chemical Engineering - Energy & Sustainability (AF)" },
  { code: "AJ", label: "Environmental and Sustainability Engineering (AJ)" },
]

const MSC_BRANCHES = [
  { code: "B1", label: "Biological Sciences (B1)" },
  { code: "B2", label: "Chemistry (B2)" },
  { code: "B3", label: "Economics (B3)" },
  { code: "B4", label: "Mathematics (B4)" },
  { code: "B5", label: "Physics (B5)" },
  { code: "B7", label: "Semiconductor and Nanoscience (B7)" },
]

export default function TimetableDashboard({ userEmail }: { userEmail?: string | null }) {
  const router = useRouter()
  const [timetables, setTimetables] = useState<LocalTimetable[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle")

  // Modal State
  const [newName, setNewName] = useState("New Timetable")
  const [primary, setPrimary] = useState("")
  const [dual, setDual] = useState("")
  const [studentId4, setStudentId4] = useState("0000")

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem("student_timetables")
      let parsed: LocalTimetable[] = []
      
      if (stored) {
        try {
          parsed = JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse timetables", e)
        }
      }

      // Fetch server drafts and merge (server wins for same id)
      try {
        setSyncStatus("syncing")
        const res = await fetch("/api/timetable/drafts")
        if (res.ok) {
          const serverDrafts: any[] = await res.json()

          if (serverDrafts.length > 0) {
            // Build a map of server drafts by id
            const serverMap = new Map(serverDrafts.map(d => [d.id, {
              id: d.id,
              name: d.name,
              bitsId: d.bitsId,
              isActive: d.isActive,
              sections: d.sections,
              updatedAt: new Date(d.updatedAt).getTime(),
            } as LocalTimetable]))

            // Find local drafts not yet on the server
            const localOnlyDrafts = parsed.filter(t => !serverMap.has(t.id))

            // Merge: server versions override local for same id; keep local-only ones
            const merged: LocalTimetable[] = []
            serverMap.forEach(draft => merged.push(draft))
            localOnlyDrafts.forEach(t => merged.push(t))
            parsed = merged
            localStorage.setItem("student_timetables", JSON.stringify(parsed))

            // Upload local-only drafts to server in background
            if (localOnlyDrafts.length > 0) {
              for (const draft of localOnlyDrafts) {
                fetch("/api/timetable/drafts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                }).catch(err => console.error("Failed to upload local draft", draft.id, err))
              }
            }

            setSyncStatus("synced")
          } else {
            // Server has no drafts at all — upload all local ones
            if (parsed.length > 0) {
              for (const draft of parsed) {
                fetch("/api/timetable/drafts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                }).catch(err => console.error("Failed to upload local draft", draft.id, err))
              }
              setSyncStatus("synced")
            } else {
              // Legacy migration: try old single-timetable endpoint
              const legacyRes = await fetch("/api/timetable/load")
              if (legacyRes.ok) {
                const serverData = await legacyRes.json()
                if (serverData && Object.keys(serverData).length > 0) {
                  const defaultBitsId = localStorage.getItem("student_bits_id") || "2024A7PS0000P"
                  const migratedTT: LocalTimetable = {
                    id: crypto.randomUUID(),
                    name: "Main Timetable",
                    bitsId: defaultBitsId,
                    isActive: true,
                    sections: serverData,
                    updatedAt: Date.now()
                  }
                  parsed = [migratedTT]
                  localStorage.setItem("student_timetables", JSON.stringify(parsed))
                  // Sync the migrated draft to the new server endpoint
                  await fetch("/api/timetable/drafts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(migratedTT),
                  })
                }
              }
              setSyncStatus("synced")
            }
          }
        } else {
          setSyncStatus("error")
        }
      } catch (err) {
        console.error("Server sync failed", err)
        setSyncStatus("error")
      }

      // Auto-fix legacy campus codes and 0000 IDs
      if (userEmail) {
        let correctCampus = "P"
        const lower = userEmail.toLowerCase()
        if (lower.includes("@hyderabad")) correctCampus = "H"
        else if (lower.includes("@goa")) correctCampus = "G"
        else if (lower.includes("@dubai")) correctCampus = "U"
        
        const emailMatch = userEmail.match(/f(\d{4})(\d{4})/i)
        const correctId4 = emailMatch ? emailMatch[2] : null

        let updated = false
        parsed = parsed.map(tt => {
          let newBitsId = tt.bitsId
          if (newBitsId && newBitsId.endsWith("P") && correctCampus !== "P") {
            updated = true
            newBitsId = newBitsId.slice(0, -1) + correctCampus
          }
          if (correctId4 && newBitsId && newBitsId.includes("0000")) {
            updated = true
            newBitsId = newBitsId.replace("0000", correctId4)
          }
          return { ...tt, bitsId: newBitsId }
        })

        if (updated) {
          localStorage.setItem("student_timetables", JSON.stringify(parsed))
          let globalId = localStorage.getItem("student_bits_id")
          if (globalId) {
             if (globalId.endsWith("P") && correctCampus !== "P") {
               globalId = globalId.slice(0, -1) + correctCampus
             }
             if (correctId4 && globalId.includes("0000")) {
               globalId = globalId.replace("0000", correctId4)
             }
             localStorage.setItem("student_bits_id", globalId)
          }
        }
      }

      setTimetables(parsed)
      setLoading(false)
    }

    init()
  }, [userEmail])

  const handleOpenCreate = () => {
    // Pre-fill from global profile
    const globalId = localStorage.getItem("student_bits_id") || "2024A7PS0000P"
    // Super basic parsing for pre-fill
    const code1 = globalId.substring(4, 6)
    const code2 = globalId.substring(6, 8)
    
    if (MSC_BRANCHES.some(b => b.code === code1)) {
      setPrimary(code1)
      if (BE_BRANCHES.some(b => b.code === code2)) {
        setDual(code2)
      } else {
        setDual("")
      }
    } else if (BE_BRANCHES.some(b => b.code === code1)) {
      setPrimary(code1)
      setDual("")
    }

    // Extract 4-digit ID from email if possible, else from globalId
    const emailMatch = userEmail?.match(/f(\d{4})(\d{4})/i)
    if (emailMatch) {
      setStudentId4(emailMatch[2])
    } else {
      // 2024 B2 AA 0456 H (length 13)
      // 2024 A7 PS 0456 H (length 13)
      if (globalId.length >= 12) {
         setStudentId4(globalId.substring(8, 12))
      }
    }

    setNewName(`Draft ${timetables.length + 1}`)
    setShowModal(true)
  }

  const handleCreate = async () => {
    // Extract year from email if possible, else 2024
    const match = userEmail?.match(/f(20\d{2})/i)
    const batchYear = match ? match[1] : "2024"

    let campusCode = "P"
    const lowerEmail = userEmail?.toLowerCase() || ""
    if (lowerEmail.includes("@hyderabad")) campusCode = "H"
    else if (lowerEmail.includes("@goa")) campusCode = "G"
    else if (lowerEmail.includes("@dubai")) campusCode = "U"

    const isMscPrimary = MSC_BRANCHES.some(b => b.code === primary)
    let generatedId = ""
    
    if (isMscPrimary) {
      if (dual) generatedId = `${batchYear}${primary}${dual}${studentId4}${campusCode}`
      else generatedId = `${batchYear}${primary}PS${studentId4}${campusCode}`
    } else {
      generatedId = `${batchYear}${primary}PS${studentId4}${campusCode}`
    }

    const newTT: LocalTimetable = {
      id: crypto.randomUUID(),
      name: newName,
      bitsId: generatedId,
      isActive: timetables.length === 0,
      sections: {},
      updatedAt: Date.now()
    }

    // Save locally first (optimistic)
    const updated = [...timetables, newTT]
    localStorage.setItem("student_timetables", JSON.stringify(updated))
    setTimetables(updated)
    setShowModal(false)

    // Sync to server in background
    try {
      await fetch("/api/timetable/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTT),
      })
    } catch (err) {
      console.error("Failed to sync new draft to server", err)
    }

    router.push(`/dashboard/timetable?id=${newTT.id}`)
  }

  const deleteTimetable = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = timetables.filter(t => t.id !== id)
    // If we deleted the active one, make another one active if possible
    if (!updated.some(t => t.isActive) && updated.length > 0) {
      updated[0].isActive = true
    }
    // Optimistic local delete
    localStorage.setItem("student_timetables", JSON.stringify(updated))
    setTimetables(updated)

    // Sync delete to server in background
    try {
      await fetch(`/api/timetable/drafts/${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("Failed to delete draft from server", err)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Timetables...</div>
  }

  const isMscPrimary = MSC_BRANCHES.some(b => b.code === primary)

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] p-4 md:p-8 h-[calc(100vh-60px)]">
      <div className="max-w-5xl mx-auto pb-20">
        
        {/* HERO */}
        <div className="mb-8 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden" 
          style={{ background: "linear-gradient(135deg, var(--bg-accent), #4f46e5)" }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold mb-1 tracking-tight">Timetable Manager</h1>
              {syncStatus === "syncing" && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white/90 animate-pulse flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 inline-block" />
                  Syncing…
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white/90 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 inline-block" />
                  Synced ☁
                </span>
              )}
              {syncStatus === "error" && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white/90 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-300 inline-block" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm font-medium">Create multiple drafts, test branch changes, and set your active schedule.</p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* CREATE NEW CARD */}
          <button
            id="tour-new-draft"
            onClick={handleOpenCreate}
            className="h-48 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed transition-all group hover:-translate-y-1 shadow-sm hover:shadow-md"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface-hover)" }}
          >
            <div className="h-12 w-12 rounded-full bg-[var(--bg-surface)] shadow-sm border border-[var(--border-subtle)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              +
            </div>
            <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              New Timetable Draft
            </span>
          </button>

          {/* LIST TIMETABLES */}
          {timetables.sort((a,b) => b.updatedAt - a.updatedAt).map(tt => (
            <div
              key={tt.id}
              onClick={() => router.push(`/dashboard/timetable?id=${tt.id}`)}
              className="h-48 relative rounded-3xl p-6 flex flex-col cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] group overflow-hidden"
            >
              {tt.isActive && (
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-bl-xl tracking-wider shadow-sm z-10">
                  ACTIVE
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 truncate pr-16" style={{ color: "var(--text-primary)" }}>{tt.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  {tt.bitsId}
                </p>
                
                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-[var(--text-muted)]">
                  <span>📚 {Object.entries(tt.sections || {}).filter(([courseCode, courseSections]: [string, any]) => {
                    const isValidCourse = master.some(m => m.courseCode === courseCode)
                    const hasActiveSection = Object.values(courseSections).some(val => !!val)
                    return isValidCourse && hasActiveSection
                  }).length} Courses</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-[var(--text-muted)]">
                  {new Date(tt.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => deleteTimetable(e, tt.id)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-surface-hover)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 transition-colors z-20 opacity-0 group-hover:opacity-100"
                  title="Delete Draft"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div id="tour-draft-modal" className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col p-6 border bg-[var(--bg-surface)] border-[var(--border-subtle)] relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                New Draft
              </h2>
              <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                You can override the branch just for this timetable to test different CDCs.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>Name</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full rounded-xl border-2 px-3 py-2.5 text-sm font-bold outline-none transition-all focus:border-[var(--bg-accent)] bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>Primary Branch</label>
                  <select
                    id="tour-modal-primary"
                    value={primary}
                    onChange={e => {
                      setPrimary(e.target.value)
                      if (!MSC_BRANCHES.some(b => b.code === e.target.value)) setDual("")
                    }}
                    className="w-full rounded-xl border-2 px-3 py-2.5 text-sm font-bold outline-none transition-all focus:border-[var(--bg-accent)] appearance-none cursor-pointer bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="" disabled>Select primary</option>
                    <optgroup label="Single Degree">{BE_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}</optgroup>
                    <optgroup label="Dual Degree">{MSC_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}</optgroup>
                  </select>
                </div>

                {isMscPrimary && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                      Dual Branch (B.E.)
                    </label>
                    <select
                      id="tour-modal-dual"
                      value={dual}
                      onChange={e => setDual(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 appearance-none transition-all"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="">None / Not Allotted</option>
                      {BE_BRANCHES.map(b => (
                        <option key={b.code} value={b.code}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                    4-Digit ID
                  </label>
                  <input
                    id="tour-modal-id"
                    type="text"
                    value={studentId4}
                    onChange={e => setStudentId4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    className="w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 appearance-none transition-all font-mono"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!primary || !newName.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "var(--bg-accent)" }}
              >
                Create Timetable
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
