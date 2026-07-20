"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const BE_BRANCHES = [
  { code: "A1", label: "Chemical (A1)" },
  { code: "A2", label: "Civil (A2)" },
  { code: "A3", label: "EEE (A3)" },
  { code: "A4", label: "Mechanical (A4)" },
  { code: "A7", label: "Computer Science (A7)" },
  { code: "A8", label: "ENI (A8)" },
  { code: "AA", label: "ECE (AA)" },
  { code: "AB", label: "Manufacturing (AB)" },
  { code: "A5", label: "B.Pharm (A5)" },
]

const MSC_BRANCHES = [
  { code: "B1", label: "Biology (B1)" },
  { code: "B2", label: "Chemistry (B2)" },
  { code: "B3", label: "Economics (B3)" },
  { code: "B4", label: "Mathematics (B4)" },
  { code: "B5", label: "Physics (B5)" },
]

export default function BranchPrompt() {
  const { data: session } = useSession()
  const [show, setShow] = useState(false)
  
  const [primary, setPrimary] = useState("")
  const [dual, setDual] = useState("")
  
  // Extract batch year and 4-digit ID from email: e.g. f20220456@pilani.bits-pilani.ac.in -> 2022, 0456
  const email = session?.user?.email || ""
  const match = email.match(/f(\d{4})(\d{4})/i)
  const batchYear = match ? match[1] : "2024" // Fallback to 2024 if weird email
  const initialStudentId4 = match ? match[2] : "0000"

  const [studentId4, setStudentId4] = useState(initialStudentId4)
  
  // Update state if email changes after mount (unlikely, but good practice)
  useEffect(() => {
    if (initialStudentId4 !== "0000" && studentId4 === "0000") {
      setStudentId4(initialStudentId4)
    }
  }, [initialStudentId4])

  useEffect(() => {
    const handleOpen = () => setShow(true)
    window.addEventListener("open-profile", handleOpen)
    
    // Auto-prompt logic on first load
    const stored = localStorage.getItem("student_bits_id")
    if (!stored) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("open-profile", handleOpen)
      }
    }
    
    return () => window.removeEventListener("open-profile", handleOpen)
  }, [])

  if (!show) return null

  // Determine which list to show in primary
  // We can just list all branches in primary, but conceptually:
  // If they choose MSc in primary, they can choose BE in dual.
  // If they choose BE in primary, dual must be None.
  const isMscPrimary = MSC_BRANCHES.some(b => b.code === primary)

  const handleSave = () => {
    let generatedId = ""
    
    let campusCode = "P"
    const lowerEmail = email.toLowerCase()
    if (lowerEmail.includes("@hyderabad")) campusCode = "H"
    else if (lowerEmail.includes("@goa")) campusCode = "G"
    else if (lowerEmail.includes("@dubai")) campusCode = "U"
    
    if (isMscPrimary) {
      if (dual) {
        // Dual degree: <year><dual><primary><4-digit><campus>
        generatedId = `${batchYear}${primary}${dual}${studentId4}${campusCode}`
      } else {
        // First year MSc (no dual yet): <year><primary>PS<4-digit><campus>
        generatedId = `${batchYear}${primary}PS${studentId4}${campusCode}`
      }
    } else {
      // Single degree BE: <year><primary>PS<4-digit><campus>
      generatedId = `${batchYear}${primary}PS${studentId4}${campusCode}`
    }

    localStorage.setItem("student_bits_id", generatedId)
    setShow(false)
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col p-6 text-center border relative"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <button 
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
        >
          ✕
        </button>

        <div
          className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-md"
          style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
        >
          🎓
        </div>
        
        <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Your Profile
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Batch {batchYear} • Setup your branches for automated CDCs.
        </p>

        <div className="text-left mb-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              Primary Branch
            </label>
            <select
              value={primary}
              onChange={e => {
                setPrimary(e.target.value)
                if (!MSC_BRANCHES.some(b => b.code === e.target.value)) {
                  setDual("") // Reset dual if they picked a BE branch
                }
              }}
              className="w-full rounded-xl border-2 px-3 py-3 text-sm font-bold outline-none transition-all focus:border-[var(--bg-accent)] appearance-none cursor-pointer"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <option value="" disabled>Select your branch</option>
              <optgroup label="Single Degree (B.E. / B.Pharm)">
                {BE_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
              </optgroup>
              <optgroup label="Dual Degree (M.Sc.)">
                {MSC_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
              </optgroup>
            </select>
          </div>

          {isMscPrimary && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                Dual Branch (B.E.)
              </label>
              <select
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
          onClick={handleSave}
          disabled={!primary}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none mt-2"
          style={{ backgroundColor: "var(--bg-accent)" }}
        >
          Save & Apply
        </button>
      </div>
    </div>
  )
}
