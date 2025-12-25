"use client"

import { useEffect, useMemo, useState } from "react"

type Exam = {
  courseCode: string
  courseTitle: string
  type: "MIDSEM" | "ENDSEM"
  date: string
  startTime: string
  endTime: string
}

function parseExamDate(date: string, time: string) {
  const [d, m] = date.trim().split("/").map(Number)
  const [h, min] = time.trim().split(":").map(Number)
  return new Date(2024, m - 1, d, h, min).getTime()
}

export default function ExamPlanner() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/exams")
      .then(res => res.json())
      .then(data => {
        setExams(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sortedExams = useMemo(() => {
    return [...exams].sort(
      (a, b) =>
        parseExamDate(a.date, a.startTime) -
        parseExamDate(b.date, b.startTime)
    )
  }, [exams])

  if (loading) return <p className="p-6">Loading exams…</p>
  if (sortedExams.length === 0)
    return <p className="p-6 text-sm">No exams scheduled</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Exam Planner</h1>

      {(["MIDSEM", "ENDSEM"] as const).map(type => {
        const list = sortedExams.filter(e => e.type === type)
        if (list.length === 0) return null

        return (
          <div key={type}>
            <h2 className="mb-2 text-sm font-semibold">{type}</h2>
            <div className="space-y-2">
              {list.map(e => (
                <div
                  key={`${e.courseCode}-${e.type}`}
                  className="rounded-lg border p-3"
                >
                  <div className="font-medium">
                    {e.courseCode} — {e.courseTitle}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {e.date} • {e.startTime} – {e.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
