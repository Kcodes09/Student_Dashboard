"use client"

import { useState, useMemo } from "react"
import AddExamModal from "@/app/components/AddExamModal"
import { detectClashes } from "@/app/lib/exams/detectClashes"
import type { ExamItem } from "./page"

/* ---------------- TYPES ---------------- */

type CourseOption = {
  code: string
  title: string
}

type ExamsClientProps = {
  midsems: ExamItem[]
  beforeMidsem: ExamItem[]
  afterMidsem: ExamItem[]
  endsems: ExamItem[]
  ttCourses: string[]
}

/* ---------------- HELPERS ---------------- */

function toDateTime(exam: ExamItem) {
  const [day, month] = exam.date.split("/").map(Number)
  const [hour, minute] = exam.startTime.split(":").map(Number)
  return new Date(2026, month - 1, day, hour, minute).getTime()
}

function sortChronologically(exams: ExamItem[]) {
  return [...exams].sort((a, b) => toDateTime(a) - toDateTime(b))
}

/* ---------------- COMPONENT ---------------- */

export default function ExamsClient({
  midsems = [],
  beforeMidsem = [],
  afterMidsem = [],
  endsems = [],
  ttCourses = [],
}: ExamsClientProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [deleteExam, setDeleteExam] = useState<ExamItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* -------- SORT SECTIONS -------- */

  const sortedMidsems = useMemo(
    () => sortChronologically(midsems),
    [midsems]
  )

  const sortedBeforeMidsem = useMemo(
    () => sortChronologically(beforeMidsem),
    [beforeMidsem]
  )

  const sortedAfterMidsem = useMemo(
    () => sortChronologically(afterMidsem),
    [afterMidsem]
  )

  const sortedEndsems = useMemo(
    () => sortChronologically(endsems),
    [endsems]
  )

  /* -------- BUILD COURSE OPTIONS FROM TT -------- */

  const courseOptions: CourseOption[] = useMemo(() => {
    return ttCourses.map(code => {
      const match =
        [
          ...sortedMidsems,
          ...sortedBeforeMidsem,
          ...sortedAfterMidsem,
          ...sortedEndsems,
        ].find(e => e.courseCode === code)

      return {
        code,
        title: match?.courseTitle ?? "",
      }
    })
  }, [
    ttCourses,
    sortedMidsems,
    sortedBeforeMidsem,
    sortedAfterMidsem,
    sortedEndsems,
  ])

  /* ---------------- DELETE ---------------- */

  const remove = async () => {
    if (!deleteExam?.id) return
    setDeleting(true)

    await fetch("/api/exams/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteExam.id }),
    })

    location.reload()
  }

  /* ---------------- RENDER SECTION ---------------- */

  const renderSection = (
    title: string,
    exams: ExamItem[],
    checkClashes: boolean
  ) => {
    if (exams.length === 0) {
      return (
        <p className="mb-6 text-sm text-gray-500">
          No {title.toLowerCase()}.
        </p>
      )
    }

    const clashes = checkClashes
      ? detectClashes(exams as any)
      : new Set<number>()

    return (
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>

        <div className="space-y-3">
          {exams.map((exam, idx) => (
            <div
              key={`${exam.courseCode}-${idx}`}
              className={`rounded-lg border p-4 ${
                clashes.has(idx)
                  ? "border-red-500 bg-red-50"
                  : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">
                    {exam.courseCode}
                  </p>
                  {exam.courseTitle && (
                    <p className="text-xs text-gray-500">
                      {exam.courseTitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {exam.type}
                  </span>
                  {exam.id && (
                    <button
                      onClick={() => setDeleteExam(exam)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm">
                📅 {exam.date} &nbsp; ⏰ {exam.startTime} – {exam.endTime}
              </div>

              {clashes.has(idx) && (
                <p className="mt-2 text-xs text-red-600">
                  ⚠️ Exam clash detected
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-blue-600 text-white px-3 py-1 text-sm"
        >
          + Add Exam
        </button>
      </div>

      {renderSection("MIDSEM", sortedMidsems, true)}
      {renderSection(
        "Before Midsem Evaluations",
        sortedBeforeMidsem,
        false
      )}
      {renderSection(
        "After Midsem Evaluations",
        sortedAfterMidsem,
        false
      )}
      {renderSection("ENDSEM", sortedEndsems, true)}

      {showAdd && (
        <AddExamModal
          onClose={() => setShowAdd(false)}
          courses={courseOptions}
        />
      )}

      {deleteExam && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h2 className="font-semibold mb-3 text-red-600">
              Delete Exam
            </h2>

            <p className="text-sm mb-4">
              Delete exam for{" "}
              <strong>{deleteExam.courseCode}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteExam(null)}>
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={remove}
                className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
