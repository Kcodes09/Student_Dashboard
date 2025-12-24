type Session = {
  day: string
  hour: number
  startTime: string
  endTime: string
  room: string
  courseCode: string
  section: string
  instructors?: string[]
}

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
      // Only include the selected section of that type
      if (selected[section.type] !== section.section) continue

      for (const s of section.sessions) {
        result.push({
          day: s.day,
          hour: s.hour, // IMPORTANT: number
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          courseCode: course.courseCode,
          section: section.section,
          instructors: section.instructors,
        })
      }
    }
  }

  return result
}
