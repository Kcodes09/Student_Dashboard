"use client"

import { MasterCourse, SectionType } from "../app/lib/timetable/types"

type SelectedSections = {
  [courseCode: string]: {
    LECTURE?: string
    TUTORIAL?: string
    PRACTICAL?: string
  }
}

type Props = {
  courses: MasterCourse[]
  selectedCourses: string[]
  selectedSections: SelectedSections
  setSelectedSections: React.Dispatch<React.SetStateAction<SelectedSections>>
}

export default function SectionSelector({
  courses,
  selectedCourses,
  selectedSections,
  setSelectedSections,
}: Props) {
  return (
    <div className="space-y-6">
      {courses.map(course => {
        if (!selectedCourses.includes(course.courseCode)) return null

        return (
          <div key={course.courseCode} className="rounded border p-4">
            <h3 className="font-semibold">
              {course.courseCode} — {course.courseTitle}
            </h3>

            {(["LECTURE", "TUTORIAL", "PRACTICAL"] as SectionType[]).map(type => {
              const sections = course.sections.filter(s => s.type === type)
              if (!sections.length) return null

              return (
                <div key={type} className="mt-3">
                  <p className="text-sm font-medium">{type}</p>

                  <div className="mt-1 flex gap-2 flex-wrap">
                    {sections.map(sec => {
                      const active =
                        selectedSections[course.courseCode]?.[type] ===
                        sec.section

                      return (
                        <button
                          key={sec.section}
                          onClick={() =>
                            setSelectedSections(prev => ({
                              ...prev,
                              [course.courseCode]: {
                                ...prev[course.courseCode],
                                [type]: sec.section,
                              },
                            }))
                          }
                          className={`rounded px-3 py-1 text-sm border transition
                            ${
                              active
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                        >
                          {sec.section}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
