// lib/timetable/types.ts

export type Day =
  | "M"
  | "T"
  | "W"
  | "Th"
  | "F"
  | "S"

export type Session = {
  day: Day
  hour: number
  startTime: string
  endTime: string
  room: string
}

export type SectionType =
  | "LECTURE"
  | "TUTORIAL"
  | "PRACTICAL"

export type Section = {
  section: string           // L1, T1, P1
  type: SectionType
  instructors: string[]
  sessions: Session[]
}

export type MasterCourse = {
  courseCode: string
  courseTitle: string
  credits: number
  sections: Section[]
}

/**
 * Raw row shape coming from uploaded.json
 * (after Excel cleaning & forward-fill)
 */
export type RawRow = {
  "COURSE NO.": string
  "COURSE TITLE": string
  U: number
  SEC: string
  "INSTRUCTOR_IN_CHARGE/INS TRUCTOR": string
  ROOM: string
  DAYS: string
  "HOUR S": number | string
}
