"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AddExamModal from "@/app/components/AddExamModal"
import type { ExamItem } from "./page"

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
}

/* ---------------- HELPERS ---------------- */

function toDateTime(exam: ExamItem) {
  const [day, month] = exam.date.split("/").map(Number)
  const [h, m] = exam.startTime.split(":").map(Number)
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
}: ExamsClientProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

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
      {/* ADD BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 rounded text-sm"
          style={{
            backgroundColor: "var(--bg-accent)",
            color: "white",
          }}
        >
          + Add Exam
        </button>
      </div>

      {renderSection(
        "Before Midsem Evaluations",
        sortedBefore
      )}
      {renderSection("Midsem Exams", sortedMid)}
      {renderSection(
        "After Midsem Evaluations",
        sortedAfter
      )}
      {renderSection("Endsem Exams", sortedEnd)}

      {showAdd && (
        <AddExamModal
          onClose={() => setShowAdd(false)}
          courses={courseOptions}
        />
      )}
    </>
  )
}
