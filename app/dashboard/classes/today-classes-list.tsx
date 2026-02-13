"use client"

import { useState } from "react"

type Status = "attended" | "absent"

type Props = {
  classes: {
    courseCode: string
    startTime: string
    endTime: string
  }[]
  dateISO: string
}

export default function TodayClassesList({
  classes,
  dateISO,
}: Props) {
  const [status, setStatus] = useState<
    Record<string, Status>
  >({})

  async function markAttended(courseCode: string) {
    await fetch("/api/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode,
        date: dateISO,
      }),
    })

    setStatus(s => ({
      ...s,
      [courseCode]: "attended",
    }))
  }

  function markAbsent(courseCode: string) {
    setStatus(s => ({
      ...s,
      [courseCode]: "absent",
    }))
  }

  async function undo(courseCode: string) {
    if (status[courseCode] === "attended") {
      await fetch("/api/attendance/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          date: dateISO,
        }),
      })
    }

    setStatus(s => {
      const copy = { ...s }
      delete copy[courseCode]
      return copy
    })
  }

  return (
    <ul className="space-y-3">
      {classes.map((c, i) => {
        const marked = status[c.courseCode]

        return (
          <li
            key={i}
            className="rounded-lg px-3 py-3"
            style={{ backgroundColor: "var(--bg-muted)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {c.courseCode}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {c.startTime} – {c.endTime}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    markAttended(c.courseCode)
                  }
                  disabled={!!marked}
                  className="text-xs px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
                >
                  Attended
                </button>

                <button
                  onClick={() =>
                    markAbsent(c.courseCode)
                  }
                  disabled={!!marked}
                  className="text-xs px-3 py-1 rounded border border-[var(--border-subtle)] disabled:opacity-50"
                >
                  Absent
                </button>
              </div>
            </div>

            {/* CONFIRMATION + UNDO */}
            {marked && (
              <div className="mt-2 flex items-center justify-between">
                <div
                  className="text-xs font-medium"
                  style={{
                    color:
                      marked === "attended"
                        ? "rgb(22 163 74)"
                        : "rgb(220 38 38)",
                  }}
                >
                  {marked === "attended"
                    ? `✔ Marked attended for ${c.courseCode}`
                    : `✖ Marked absent for ${c.courseCode}`}
                </div>

                <button
                  onClick={() => undo(c.courseCode)}
                  className="text-xs underline text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Undo
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
function NextClass({
  classes,
  dateISO,
}: Props) {
  
  

  return (
    <ul className="space-y-3">
      {classes.map((c, i) => {
        

        return (
          <li
            key={i}
            className="rounded-lg px-3 py-3"
            style={{ backgroundColor: "var(--bg-muted)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {c.courseCode}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {c.startTime} – {c.endTime}
                </div>
              </div>

              <div className="flex gap-2">
                
              </div>
            </div>

           
           
          </li>
        )
      })}
    </ul>
  )
}
  