export type WeekDay = "M" | "T" | "W" | "Th" | "F" | "S"

export type Session = {
  day: WeekDay
  courseCode: string
  startTime: string
  endTime: string
}

export type Exam = {
  courseCode: string
  date: string
  startTime: string
  endTime: string
}

export type CalendarDay = {
  date: string
  label?: string
  holiday?: boolean
}
