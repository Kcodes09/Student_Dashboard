"use client"

import { useState, useMemo } from "react"
import AddExamModal from "@/app/components/AddExamModal"
import { detectClashes } from "@/app/lib/exams/detectClashes"

/* ---------------- TYPES ---------------- */

type ExamItem = {
  id?: string
  courseCode: string
  courseTitle?: string
  type: string
  date: string // DD/MM
  startTime: string
  endTime: string
}

type CourseOption = {
  code: string
  title: string
}

type ExamsClientProps = {
  midsems: ExamItem[]
  beforeMidsem: ExamItem[]
  afterMidsem: ExamItem[]
  endsems: ExamItem[]
}

/* ---------------- COMPONENT ---------------- */

export default function ExamsClient({
  midsems = [],
  beforeMidsem = [],
  afterMidsem = [],
  endsems = [],
}: ExamsClientProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [deleteExam, setDeleteExam] = useState<ExamItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* -------- BUILD COURSE OPTIONS --------
     From all exams, unique by courseCode.
     (These are the user's selected courses.)
  */
  const courseOptions: CourseOption[] = useMemo(() => {
    const map = new Map<string, CourseOption>()

    ;[...midsems, ...beforeMidsem, ...afterMidsem, ...endsems].forEach(e => {
      if (!map.has(e.courseCode)) {
        map.set(e.courseCode, {
          code: e.courseCode,
          title: e.courseTitle ?? "",
        })
      }
    })

    return Array.from(map.values())
  }, [midsems, beforeMidsem, afterMidsem, endsems])

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

  /* ---------------- RENDER HELPERS ---------------- */

  const renderSection = (
    title: string,
    exams: ExamItem[],
    checkClashes: boolean
  ) => {
    if (exams.length === 0) {
      return (
        <div>
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        <p className="mb-6 text-sm text-gray-500">
          No {title.toLowerCase()}.
        </p>
        </div>
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

                  {/* Only user-added exams have id */}
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
      {/* ADD EXAM */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-blue-600 text-white px-3 py-1 text-sm"
        >
          + Add Exam
        </button>
      </div>

      {renderSection("BEFORE MIDSEM EVALUATIONS", beforeMidsem, false)}
      {renderSection("MIDSEM", midsems, true)}
      {renderSection("AFTER MIDSEM EVALUATIONS", afterMidsem, false)}
      {renderSection("ENDSEM", endsems, true)}


      {/* ADD MODAL */}
      {showAdd && (
        <AddExamModal
          onClose={() => setShowAdd(false)}
          courses={courseOptions}
        />
      )}

      {/* DELETE MODAL */}
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
