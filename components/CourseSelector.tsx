"use client"

import { MasterCourse } from "../app/lib/timetable/types"

type Props = {
  courses: MasterCourse[]
  selectedCourses: string[]
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>
}

export default function CourseSelector({
  courses,
  selectedCourses,
  setSelectedCourses,
}: Props) {
  const toggleCourse = (code: string) => {
    setSelectedCourses(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    )
  }

  return (
    <div className="rounded border p-4">
      <h2 className="mb-3 font-semibold">Select Courses</h2>

      <div className="flex flex-wrap gap-2">
        {courses.map(course => {
          const active = selectedCourses.includes(course.courseCode)

          return (
            <button
              key={course.courseCode}
              onClick={() => toggleCourse(course.courseCode)}
              className={`rounded px-3 py-1 text-sm border transition
                ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
            >
              {course.courseCode}
            </button>
          )
        })}
      </div>
    </div>
  )
}
