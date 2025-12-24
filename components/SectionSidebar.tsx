"use client"

import clsx from "clsx"

type Section = {
  section: string
  type: "LECTURE" | "TUTORIAL" | "PRACTICAL"
  instructors: string[]
  sessions: any[]
}

type Course = {
  courseCode: string
  courseTitle: string
  sections: Section[]
}

type Props = {
  course?: Course
  selected?: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
  onSelect: (
    type: "LECTURE" | "TUTORIAL" | "PRACTICAL",
    section: string | undefined
  ) => void
}

const TYPES: Array<Section["type"]> = [
  "LECTURE",
  "TUTORIAL",
  "PRACTICAL",
]

export default function SectionSidebar({
  course,
  selected = {},
  onSelect,
}: Props) {
  if (!course) {
    return (
      <aside className="w-96 border-r bg-[var(--bg-surface)] p-4">
        <p className="text-sm text-[var(--text-muted)]">
          Select a course to view sections
        </p>
      </aside>
    )
  }

  return (
    <aside className="w-96 border-r bg-[var(--bg-surface)] p-4 overflow-y-auto">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold">
          {course.courseCode}
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {course.courseTitle}
        </p>
      </div>

      {/* SECTION TYPES */}
      <div className="space-y-6">
        {TYPES.map(type => {
          const sections = course.sections.filter(
            s => s.type === type
          )
          if (!sections.length) return null

          return (
            <div key={type}>
              <h3 className="mb-2 text-xs font-semibold text-[var(--text-muted)]">
                {type}
              </h3>

              <div className="space-y-2">
                {sections.map(s => {
                  const isSelected = selected[type] === s.section

                  return (
                    <button
                      key={s.section}
                      onClick={() =>
                        onSelect(
                          type,
                          isSelected ? undefined : s.section
                        )
                      }
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-left transition",
                        "hover:bg-[var(--bg-hover)]",
                        isSelected &&
                          "border-[var(--bg-accent)] bg-[var(--bg-selected)]"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">
                          {s.section}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-[var(--bg-accent)]">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {s.instructors.join(", ")}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
