"use client"

import { useState } from "react"

type CourseOption = {
  code: string
  title: string
}

export default function AddExamModal({
  onClose,
  courses,
}: {
  onClose: () => void
  courses: CourseOption[]
}) {
  const [isOther, setIsOther] = useState(false)

  const [form, setForm] = useState({
    courseCode: "",
    courseTitle: "",
    type: "QUIZ",
    date: "",
    startTime: "",
    endTime: "",
  })

  const onCourseChange = (value: string) => {
    if (value === "__OTHER__") {
      setIsOther(true)
      setForm({
        ...form,
        courseCode: "",
        courseTitle: "",
      })
      return
    }

    const course = courses.find(c => c.code === value)

    setIsOther(false)
    setForm({
      ...form,
      courseCode: value,
      courseTitle: course?.title ?? "",
    })
  }

  const submit = async () => {
    await fetch("/api/exams/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    onClose()
    location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div 
        className="rounded-lg p-4 w-full max-w-sm shadow-xl"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)"
        }}
      >
        <h2 className="font-semibold mb-3">Add Exam</h2>

        {/* COURSE SELECT */}
        <select
          className="w-full mb-2 border p-2 rounded outline-none"
          style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          onChange={e => onCourseChange(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select course
          </option>

          {courses.map(c => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}

          <option value="__OTHER__">Others</option>
        </select>

        {/* COURSE CODE */}
        {isOther && (
          <input
            placeholder="Course Code"
            className="w-full mb-2 border p-2 rounded outline-none"
            style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            value={form.courseCode}
            onChange={e =>
              setForm({ ...form, courseCode: e.target.value })
            }
          />
        )}

        {/* COURSE TITLE */}
        <input
          placeholder="Course Title"
          className="w-full mb-2 border p-2 rounded outline-none disabled:opacity-50"
          style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          value={form.courseTitle}
          disabled={!isOther}
          onChange={e =>
            setForm({ ...form, courseTitle: e.target.value })
          }
        />

        {/* TYPE */}
        <select
          className="w-full mb-2 border p-2 rounded outline-none"
          style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          value={form.type}
          onChange={e =>
            setForm({ ...form, type: e.target.value })
          }
        >
          <option>QUIZ</option>
          <option>EVAL</option>
          <option>OTHER</option>
        </select>

        {/* DATE */}
        <input
          type="date"
          className="w-full mb-2 border p-2 rounded outline-none"
          style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          onChange={e =>
            setForm({ ...form, date: e.target.value })
          }
        />

        {/* TIME */}
        <div className="flex gap-2">
          <input
            type="time"
            className="w-full border p-2 rounded outline-none"
            style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            onChange={e =>
              setForm({ ...form, startTime: e.target.value })
            }
          />
          <input
            type="time"
            className="w-full border p-2 rounded outline-none"
            style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            onChange={e =>
              setForm({ ...form, endTime: e.target.value })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-3 py-1.5 rounded text-sm text-white hover:opacity-90 transition-opacity shadow-sm"
            style={{ backgroundColor: "var(--bg-accent)" }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
