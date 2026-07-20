"use client"

import { useMemo, useState, useEffect } from "react"
import { parseBitsId, inferSemesterKey, getCdcsForId, type CDC } from "../lib/cdcHelper"

type Props = {
  /** All course codes present in the master timetable this semester */
  availableCodes: Set<string>
  onApply: (codes: string[]) => void
  onClose: () => void
}

const BRANCH_MAP: Record<string, { type: "BE" | "MSc", branch: string }> = {
  "A1": { type: "BE", branch: "Chemical" },
  "A2": { type: "BE", branch: "Civil" },
  "A3": { type: "BE", branch: "Electrical & Electronics" },
  "A4": { type: "BE", branch: "Mechanical" },
  "A7": { type: "BE", branch: "Computer Science" },
  "A8": { type: "BE", branch: "Electronics & Instrumentation" },
  "AA": { type: "BE", branch: "Electronics & Communication" },
  "B1": { type: "MSc", branch: "Biological Sciences" },
  "B2": { type: "MSc", branch: "Chemistry" },
  "B3": { type: "MSc", branch: "Economics" },
  "B4": { type: "MSc", branch: "Mathematics" },
  "B5": { type: "MSc", branch: "Physics" },
}

const YEAR_SEM_OPTIONS_SINGLE = [
  { label: "Year 2 — Semester 1", key: "year2_sem1" },
  { label: "Year 2 — Semester 2", key: "year2_sem2" },
  { label: "Year 3 — Semester 1", key: "year3_sem1" },
  { label: "Year 3 — Semester 2", key: "year3_sem2" },
]

const YEAR_SEM_OPTIONS_DUAL = [
  ...YEAR_SEM_OPTIONS_SINGLE,
  { label: "Year 4 — Semester 1", key: "year4_sem1" },
  { label: "Year 4 — Semester 2", key: "year4_sem2" },
]

const YEAR1_SEM_OPTIONS = [
  { label: "Year 1 — Semester 1", key: "sem1" },
  { label: "Year 1 — Semester 2", key: "sem2" },
]

export default function CDCSelector({ availableCodes, onApply, onClose }: Props) {
  const [idNumber, setIdNumber] = useState("")
  const [selectedSemKey, setSelectedSemKey] = useState<string>("year2_sem1")
  const [manualSemSelect, setManualSemSelect] = useState(false)

  /* Parse ID to extract joining year and branches */
  const parsed = useMemo(() => parseBitsId(idNumber), [idNumber])

  const isDual = useMemo(() => {
    return parsed?.branches.some(b => b.type === "MSc") && parsed?.branches.some(b => b.type === "BE")
  }, [parsed])

  /* Auto-select semester based on joining year */
  useEffect(() => {
    if (parsed && !manualSemSelect) {
      setSelectedSemKey(inferSemesterKey(parsed))
    }
  }, [parsed, manualSemSelect])

  /* Compute CDC list for selection */
  const cdcList = useMemo(() => {
    if (!idNumber) return []
    return getCdcsForId(idNumber, selectedSemKey)
  }, [idNumber, selectedSemKey])

  /* Split into available (in master TT) vs not offered this semester */
  const inMaster = cdcList.filter(c => availableCodes.has(c.code))
  const notInMaster = cdcList.filter(c => !availableCodes.has(c.code))

  const handleApply = () => {
    onApply(inMaster.map(c => c.code))
    onClose()
  }

  const semOptions = parsed?.isYear1 ? YEAR1_SEM_OPTIONS : (isDual ? YEAR_SEM_OPTIONS_DUAL : YEAR_SEM_OPTIONS_SINGLE)

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              🎓 Smart Fill — CDCs
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Enter your BITS ID to auto-detect your CDCs
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-lg hover:bg-[var(--bg-surface-hover)]"
            style={{ color: "var(--text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Inputs */}
        <div className="px-6 py-5 space-y-5 shrink-0 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          {/* ID Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
              BITS ID Number
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={e => setIdNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 2024A7PS1234H or 2023B3A70123H"
              className="w-full rounded-xl border-2 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-[var(--bg-accent)]"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
            {parsed && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-500">
                  {parsed.year} Batch
                </span>
                {parsed.branches.map(b => (
                  <span key={b.branch} className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600">
                    {b.type} {b.branch}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Semester Selection */}
          {parsed && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-muted)" }}>
                Target Semester
              </label>
              <div className="grid grid-cols-2 gap-2">
                {semOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelectedSemKey(opt.key)
                      setManualSemSelect(true)
                    }}
                    className="rounded-lg px-3 py-2 text-xs font-semibold transition-all border text-left"
                    style={{
                      backgroundColor: selectedSemKey === opt.key ? "var(--bg-selected)" : "var(--bg-surface-hover)",
                      borderColor: selectedSemKey === opt.key ? "var(--bg-accent)" : "var(--border-subtle)",
                      color: selectedSemKey === opt.key ? "var(--text-accent)" : "var(--text-primary)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CDC List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!parsed ? (
             <div className="flex flex-col items-center justify-center py-8 opacity-60">
               <span className="text-4xl mb-3">🪪</span>
               <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                 Enter your ID to see CDCs
               </p>
             </div>
          ) : cdcList.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              No CDCs found for this selection
            </p>
          ) : (
            <>
              {inMaster.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--text-accent)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    Available in Timetable ({inMaster.length})
                  </p>
                  <div className="space-y-1.5">
                    {inMaster.map(c => (
                      <div
                        key={c.code}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 border"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.06)",
                          borderColor: "rgba(16,185,129,0.25)",
                        }}
                      >
                        <span
                          className="shrink-0 text-[11px] font-black px-1.5 py-0.5 rounded-md tracking-wide"
                          style={{
                            backgroundColor: "rgba(16,185,129,0.15)",
                            color: "rgb(5,150,105)",
                          }}
                        >
                          {c.code}
                        </span>
                        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {c.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notInMaster.length > 0 && (
                <div className={inMaster.length > 0 ? "mt-5" : ""}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
                    Not offered this semester ({notInMaster.length})
                  </p>
                  <div className="space-y-1.5">
                    {notInMaster.map(c => (
                      <div
                        key={c.code}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 border opacity-50"
                        style={{
                          backgroundColor: "var(--bg-surface-hover)",
                          borderColor: "var(--border-subtle)",
                        }}
                      >
                        <span
                          className="shrink-0 text-[11px] font-black px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: "var(--bg-muted)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {c.code}
                        </span>
                        <span className="text-xs font-medium line-through" style={{ color: "var(--text-muted)" }}>
                          {c.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0 bg-[var(--bg-surface)] rounded-b-2xl"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {inMaster.length > 0
              ? `${inMaster.length} CDC${inMaster.length !== 1 ? "s" : ""} will be highlighted`
              : ""}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--bg-surface-hover)]"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-muted)",
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={inMaster.length === 0}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              style={{ backgroundColor: "var(--bg-accent)" }}
            >
              Highlight CDCs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
