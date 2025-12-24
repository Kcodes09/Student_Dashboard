type Session = {
  day: string
  hour: number
  startTime: string
  endTime: string
  room: string
  courseCode: string
  section: string
  instructors: string[]
}

type SectionType = "LECTURE" | "TUTORIAL" | "PRACTICAL"

export function generateStudentTT(
  courses: any[],
  selectedSections: {
    [courseCode: string]: {
      LECTURE?: string
      TUTORIAL?: string
      PRACTICAL?: string
    }
  }
): Session[] {
  const result: Session[] = []

  for (const course of courses) {
    const selected = selectedSections[course.courseCode]
    if (!selected) continue

    for (const section of course.sections) {
      const type = section.type as SectionType

      // 🔒 SAFETY CHECKS
      if (!selected[type]) continue
      if (selected[type] !== section.section) continue

      for (const s of section.sessions) {
        result.push({
          ...s,
          courseCode: course.courseCode,
          section: section.section,
          instructors: section.instructors,
        })
      }
    }
  }

  return result
}
