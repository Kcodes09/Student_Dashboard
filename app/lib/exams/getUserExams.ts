import exams from "@/lib/data/exams_normalized.json"

export function getUserExams(
  sessions: any[] | undefined
) {
  if (!Array.isArray(sessions)) {
    return []
  }

  const activeCourses = new Set(
    sessions.map(s => s.courseCode)
  )

  return exams.filter(e =>
    activeCourses.has(e.courseCode)
  )
}
