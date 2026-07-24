"use client"

import React, { useMemo, useState, Fragment, useRef } from "react"
import { useRouter } from "next/navigation"
import AddExamModal from "@/app/components/AddExamModal"
import type { ExamItem } from "./page"
import { toPng } from "html-to-image"

/* ---------------- TYPES ---------------- */

type CourseOption = {
  code: string
  title: string
}

type ExamsClientProps = {
  beforeMidsem: ExamItem[]
  midsems: ExamItem[]
  afterMidsem: ExamItem[]
  endsems: ExamItem[]
  midsemCalendarDates: string[]
  compreCalendarDates: string[]
}

/* ---------------- HELPERS ---------------- */

function toDateTime(exam: ExamItem) {
  const [day, month] = exam.date.split("/").map(Number)
  let [h, m] = exam.startTime.split(":").map(Number)
  if (h < 8) h += 12
  return new Date(2026, month - 1, day, h, m).getTime()
}

function sortChronologically(exams: ExamItem[]) {
  return [...exams].sort(
    (a, b) => toDateTime(a) - toDateTime(b)
  )
}

/* ---------------- COMPONENT ---------------- */

export default function ExamsClient({
  beforeMidsem,
  midsems,
  afterMidsem,
  endsems,
  midsemCalendarDates,
  compreCalendarDates,
}: ExamsClientProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  /* ---------- SORT ---------- */

  const sortedBefore = useMemo(
    () => sortChronologically(beforeMidsem),
    [beforeMidsem]
  )

  const sortedMid = useMemo(
    () => sortChronologically(midsems),
    [midsems]
  )

  const sortedAfter = useMemo(
    () => sortChronologically(afterMidsem),
    [afterMidsem]
  )

  const sortedEnd = useMemo(
    () => sortChronologically(endsems),
    [endsems]
  )

  /* ---------- COURSE OPTIONS FOR MODAL ---------- */

  const courseOptions: CourseOption[] = useMemo(() => {
    const map = new Map<string, string>()

    ;[
      ...beforeMidsem,
      ...midsems,
      ...afterMidsem,
      ...endsems,
    ].forEach(e => {
      if (!map.has(e.courseCode)) {
        map.set(e.courseCode, e.courseTitle ?? "")
      }
    })

    return Array.from(map.entries()).map(
      ([code, title]) => ({
        code,
        title,
      })
    )
  }, [beforeMidsem, midsems, afterMidsem, endsems])

  /* ---------- DELETE ---------- */

  async function deleteExam(id: string) {
    setDeletingId(id)

    await fetch("/api/exams/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    router.refresh()
  }

  /* ---------- EXPORT ---------- */

  const containerRef = useRef<HTMLDivElement>(null)

  async function exportToPng() {
    if (!containerRef.current) return
    try {
      setIsExporting(true)
      // Wait for React to apply 'w-max' and remove 'overflow-x-auto'
      await new Promise(resolve => setTimeout(resolve, 150))

      const dataUrl = await toPng(containerRef.current, { 
        backgroundColor: "var(--bg-base)",
        pixelRatio: 2 // High res
      })
      const link = document.createElement("a")
      link.download = "exam-schedule.png"
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Failed to export schedule to PNG", err)
      alert("Failed to export schedule.")
    } finally {
      setIsExporting(false)
    }
  }

  /* ---------- RENDER ---------- */

  function renderSection(
    title: string,
    exams: ExamItem[]
  ) {
    return (
      <section className="mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3">
          {title}
        </h2>

        {exams.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No exams scheduled.
          </p>
        ) : (
          <div className="space-y-3">
            {exams.map((exam, idx) => (
              <div
                key={`${exam.courseCode}-${idx}`}
                className="rounded-lg p-3 sm:p-4"
                style={{
                  backgroundColor:
                    "var(--bg-surface)",
                  border:
                    "1px solid var(--border-subtle)",
                }}
              >
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {exam.courseCode}
                    </p>
                    {exam.courseTitle && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {exam.courseTitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium">
                      {exam.type}
                    </span>

                    {/* DELETE ONLY FOR USER-ADDED EXAMS */}
                    {exam.id && (
                      <button
                        onClick={() =>
                          deleteExam(exam.id!)
                        }
                        disabled={
                          deletingId === exam.id
                        }
                        className="text-xs disabled:opacity-50"
                        style={{
                          color: "rgb(239 68 68)",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* DATE & TIME */}
                <div className="mt-2 text-sm">
                  📅 {exam.date} &nbsp; ⏰{" "}
                  {exam.startTime} –{" "}
                  {exam.endTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      {/* HEADER ACTIONS */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <button
          onClick={exportToPng}
          className="px-3 py-1.5 rounded text-sm transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          ⬇ Export PNG
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 rounded text-sm transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--bg-accent)",
            color: "white",
          }}
        >
          + Add Exam
        </button>
      </div>

      <div ref={containerRef} className={`rounded-xl ${isExporting ? 'w-max pr-8' : ''}`} style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="p-1 sm:p-2">

      {renderSection(
        "Before Midsem Evaluations",
        sortedBefore
      )}
      
      {/* MIDSEM TABLE */}
      {(() => {
        if (sortedMid.length === 0) return renderSection("Midsem Exams", sortedMid)

        const midsemDates = midsemCalendarDates.length > 0 ? midsemCalendarDates : ["05/10", "06/10", "07/10", "08/10", "09/10", "10/10"]
        const formattedDates = midsemDates.map(d => {
           const [day, month] = d.split('/').map(Number);
           const dateObj = new Date(2026, month - 1, day);
           const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
           const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
           return {
             raw: d,
             dateStr: `${day} ${monthNames[month - 1]}`,
             dayStr: dayNames[dateObj.getDay()]
           };
        })

        const slots = [
          { label: "FN1", time: "9:30-11:00", startHour: 9.5 },
          { label: "FN2", time: "11:30-1:00", startHour: 11.5 },
          { label: "AN1", time: "2:00-3:30", startHour: 14.0 },
          { label: "AN2", time: "4:00-5:30", startHour: 16.0 }
        ]

        return (
          <section className="mb-8 rounded-xl overflow-hidden shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="pt-6 pb-4 px-4 sm:px-6">
              <div className="text-center text-[10px] sm:text-[11px] font-bold tracking-widest mb-6 uppercase" style={{ color: "var(--text-muted)" }}>
                 Midsem Week • 5-10 Oct • Only the exam week is shown
              </div>
              
              <div className={`${isExporting ? '' : 'overflow-x-auto'} pb-2 scrollbar-thin scrollbar-thumb-gray-500/30 scrollbar-track-transparent`}>
                <div className="grid gap-[8px]" style={{ gridTemplateColumns: "100px repeat(6, minmax(140px, 1fr))", minWidth: "940px" }}>
                  
                  {/* Header Row */}
                  <div></div> {/* Empty top-left cell */}
                  {formattedDates.map(d => (
                     <div key={d.raw} className="text-center pb-2">
                       <div className="font-bold text-[14px]">{d.dateStr}</div>
                       <div className="text-[12px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{d.dayStr}</div>
                     </div>
                  ))}

                  {/* Grid Rows */}
                  {slots.map(slot => (
                    <Fragment key={slot.label}>
                      {/* Row Header */}
                      <div className="flex flex-col justify-center px-3 py-2 rounded-lg border" style={{ backgroundColor: "var(--bg-base, rgba(0,0,0,0.02))", borderColor: "var(--border-subtle)" }}>
                        <span className="font-bold text-[14px]">{slot.label}</span>
                        <span className="text-[11px] whitespace-nowrap font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{slot.time}</span>
                      </div>

                      {/* Cells */}
                      {midsemDates.map(date => {
                         // Assign based on exact start time
                         const exam = sortedMid.find(e => {
                            if (e.date !== date) return false;
                            let [h, m] = e.startTime.split(':').map(Number);
                            if (h < 8) h += 12; // Handle non-24h format in JSON
                            const tHour = h + m / 60;
                            // Match if start time is within 30 minutes of the slot start
                            return Math.abs(tHour - slot.startHour) < 0.5;
                         });
                         
                         return (
                           <div key={`${slot.label}-${date}`} className="rounded-lg flex flex-col items-center justify-center p-1.5 min-h-[64px] transition-colors border" style={{ backgroundColor: "var(--bg-base, rgba(0,0,0,0.02))", borderColor: "var(--border-subtle)" }}>
                             {exam ? (
                                <>
                                  <div className="px-2 py-2 rounded-md tracking-wide w-full text-center flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--bg-accent)", color: "white" }} title={exam.courseTitle || exam.courseCode}>
                                     <span className="font-bold text-[12px]">{exam.courseCode}</span>
                                     {exam.courseTitle && <span className="text-[9px] leading-[1.1] mt-0.5 opacity-90 truncate w-full px-1">{exam.courseTitle}</span>}
                                  </div>
                                  {exam.id && (
                                     <button onClick={() => deleteExam(exam.id!)} disabled={deletingId === exam.id} className="text-[10px] mt-1 text-red-500/80 hover:text-red-500 disabled:opacity-50 transition-colors uppercase tracking-wider">Delete</button>
                                  )}
                                </>
                             ) : (
                                <div className="w-full h-full rounded-md opacity-20"></div>
                             )}
                           </div>
                         )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* Other Exams (that didn't fit in the week) */}
              {(() => {
                const otherExams = sortedMid.filter(e => !midsemDates.includes(e.date));
                if (otherExams.length === 0) return null;
                return (
                  <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <h3 className="text-[10px] font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Other Midsem Exams</h3>
                    <div className="flex flex-wrap gap-2">
                       {otherExams.map((e, idx) => (
                          <div key={idx} className="px-3 py-2 rounded-lg border" style={{ backgroundColor: "var(--bg-base, rgba(0,0,0,0.02))", borderColor: "var(--border-subtle)" }}>
                             <div className="font-bold text-[12px] mb-1" style={{ color: "var(--bg-accent)" }}>{e.courseCode}</div>
                             <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{e.date} • {e.startTime}</div>
                             {e.id && (
                               <button onClick={() => deleteExam(e.id!)} disabled={deletingId === e.id} className="text-[9px] mt-2 text-red-500/80 hover:text-red-500 disabled:opacity-50 uppercase tracking-wider">Delete</button>
                             )}
                          </div>
                       ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )
      })()}

      {renderSection(
        "After Midsem Evaluations",
        sortedAfter
      )}

      {/* COMPRE TABLE */}
      {(() => {
        if (sortedEnd.length === 0) return renderSection("Endsem Exams", sortedEnd)

        const dynamicDates = Array.from(new Set(sortedEnd.map(e => e.date))).sort((a, b) => {
           const [da, ma] = a.split('/').map(Number)
           const [db, mb] = b.split('/').map(Number)
           if (ma !== mb) return ma - mb
           return da - db
        })

        const dates = compreCalendarDates.length > 0 ? compreCalendarDates : dynamicDates;

        // For display format like "1 Dec"
        const formattedDates = dates.map(d => {
           const [day, month] = d.split('/').map(Number);
           const dateObj = new Date(2026, month - 1, day);
           const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
           const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
           return {
             raw: d,
             dateStr: `${day} ${monthNames[month - 1]}`,
             dayStr: dayNames[dateObj.getDay()]
           };
        })

        const slots = [
          { label: "Morning", time: "9:00 - 12:00" },
          { label: "Afternoon", time: "2:00 - 5:00" }
        ]

        return (
          <section className="mb-8 rounded-xl overflow-hidden shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="pt-6 pb-4 px-4 sm:px-6">
              <div className="text-center text-[10px] sm:text-[11px] font-bold tracking-widest mb-6 uppercase" style={{ color: "var(--text-muted)" }}>
                 Comprehensive Exams • Scheduled Dates
              </div>
              
              <div className={`${isExporting ? '' : 'overflow-x-auto'} pb-2 scrollbar-thin scrollbar-thumb-gray-500/30 scrollbar-track-transparent`}>
                <div className="grid gap-[8px]" style={{ gridTemplateColumns: `100px repeat(${dates.length}, minmax(140px, 1fr))`, minWidth: `${100 + (dates.length * 140)}px` }}>
                  
                  {/* Header Row */}
                  <div></div>
                  {formattedDates.map(d => (
                     <div key={d.raw} className="text-center pb-2">
                       <div className="font-bold text-[14px]">{d.dateStr}</div>
                       <div className="text-[12px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{d.dayStr}</div>
                     </div>
                  ))}

                  {/* Grid Rows */}
                  {slots.map(slot => (
                    <Fragment key={slot.label}>
                      {/* Row Header */}
                      <div className="flex flex-col justify-center px-3 py-2 rounded-lg border" style={{ backgroundColor: "var(--bg-base, rgba(0,0,0,0.02))", borderColor: "var(--border-subtle)" }}>
                        <span className="font-bold text-[14px]">{slot.label}</span>
                        <span className="text-[11px] whitespace-nowrap font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{slot.time}</span>
                      </div>

                      {/* Cells */}
                      {dates.map((date) => {
                         const exam = sortedEnd.find(e => {
                            if (e.date !== date) return false;
                            const [h, m] = e.startTime.split(':').map(Number);
                            const t = h * 60 + m;
                            if (slot.label === "Morning") return t < 13*60;
                            if (slot.label === "Afternoon") return t >= 13*60;
                            return false;
                         });
                         
                         return (
                           <div key={`${slot.label}-${date}`} className="rounded-lg flex flex-col items-center justify-center p-1.5 min-h-[64px] transition-colors border" style={{ backgroundColor: "var(--bg-base, rgba(0,0,0,0.02))", borderColor: "var(--border-subtle)" }}>
                             {exam ? (
                                <>
                                  <div className="px-2 py-2 rounded-md tracking-wide w-full text-center flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--bg-accent)", color: "white" }} title={exam.courseTitle || exam.courseCode}>
                                     <span className="font-bold text-[12px]">{exam.courseCode}</span>
                                     {exam.courseTitle && <span className="text-[9px] leading-[1.1] mt-0.5 opacity-90 truncate w-full px-1">{exam.courseTitle}</span>}
                                  </div>
                                  {exam.id && (
                                     <button onClick={() => deleteExam(exam.id!)} disabled={deletingId === exam.id} className="text-[10px] mt-1 text-red-500/80 hover:text-red-500 disabled:opacity-50 transition-colors uppercase tracking-wider">Delete</button>
                                  )}
                                </>
                             ) : (
                                <div className="w-full h-full rounded-md opacity-20"></div>
                             )}
                           </div>
                         )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })()}
        </div>
      </div>

      {showAdd && (
        <AddExamModal
          onClose={() => setShowAdd(false)}
          courses={courseOptions}
        />
      )}
    </>
  )
}
