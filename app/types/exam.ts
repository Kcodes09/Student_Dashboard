export type ExamType = "MIDSEM" | "ENDSEM"

export type Exam = {
  courseCode: string
  type: ExamType
  date: string
  startTime: string
  endTime: string
  venue: string
}
