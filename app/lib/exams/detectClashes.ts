type Exam = {
  courseCode: string
  courseTitle: string
  type: string
  date: string
  startTime: string
  endTime: string
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function detectClashes(exams: Exam[]) {
  const clashes = new Set<number>()

  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      if (exams[i].date !== exams[j].date) continue

      const aStart = toMinutes(exams[i].startTime)
      const aEnd = toMinutes(exams[i].endTime)
      const bStart = toMinutes(exams[j].startTime)
      const bEnd = toMinutes(exams[j].endTime)

      const overlap = aStart < bEnd && bStart < aEnd
      if (overlap) {
        clashes.add(i)
        clashes.add(j)
      }
    }
  }

  return clashes
}
