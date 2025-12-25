type Exam = {
  courseCode: string
  date: string
  startTime: string
  endTime: string
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function detectExamClashes(exams: Exam[]) {
  const clashes: Exam[][] = []

  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      const a = exams[i]
      const b = exams[j]

      if (a.date !== b.date) continue

      const aStart = toMinutes(a.startTime)
      const aEnd = toMinutes(a.endTime)
      const bStart = toMinutes(b.startTime)
      const bEnd = toMinutes(b.endTime)

      if (aStart < bEnd && bStart < aEnd) {
        clashes.push([a, b])
      }
    }
  }

  return clashes
}
