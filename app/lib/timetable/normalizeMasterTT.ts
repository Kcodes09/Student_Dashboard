// app/lib/timetable/normalizeMasterTT.ts

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

export type Session = {
  day: string
  hour: number
  startTime: string
  endTime: string
  room: string
}

export type Section = {
  section: string
  type: "LECTURE" | "TUTORIAL" | "PRACTICAL"
  instructors: string[]
  sessions: Session[]
}

export type MasterCourse = {
  courseCode: string
  courseTitle: string
  credits: number
  sections: Section[]
}

/* ---------------- CONSTANTS ---------------- */

const DAY_SET = new Set(["M", "T", "W", "Th", "F", "S"])

const HOUR_TIME_MAP: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "08:50" },
  2: { start: "09:00", end: "09:50" },
  3: { start: "10:00", end: "10:50" },
  4: { start: "11:00", end: "11:50" },
  5: { start: "12:00", end: "12:50" },
  6: { start: "13:00", end: "13:50" },
  7: { start: "14:00", end: "14:50" },
  8: { start: "15:00", end: "15:50" },
  9: { start: "16:00", end: "16:50" },
  10: { start: "17:00", end: "17:50" },
  11: { start: "18:00", end: "18:50" },
  12: { start: "19:00", end: "19:50" },
}

/* ---------------- HELPERS ---------------- */

function getType(sec: string): Section["type"] {
  if (sec.startsWith("P")) return "PRACTICAL"
  if (sec.startsWith("T")) return "TUTORIAL"
  return "LECTURE"
}

function parseDays(days: string): string[] {
  return days
    .split(/\s+/)
    .map(d => d.trim())
    .filter(d => DAY_SET.has(d))
}

function parseHours(
  hours: number | string,
  type: Section["type"]
): number[] {
  const raw = hours.toString().trim()

  /* ---------- ALL TYPES: space-separated ---------- */
  if (raw.includes(" ")) {
    return raw
      .split(/\s+/)
      .map(Number)
      .filter(n => !isNaN(n))
  }

  /* ---------- LECTURE / TUTORIAL ---------- */
  if (type !== "PRACTICAL") {
    const n = Number(raw)
    if (!isNaN(n)) return [n]
    throw new Error(`Invalid HOURS value: ${hours}`)
  }

  /* ---------- PRACTICAL (packed) ---------- */
  const result: number[] = []
  let i = 0

  while (i < raw.length) {
    const twoDigit = Number(raw.slice(i, i + 2))
    if (twoDigit >= 10 && twoDigit <= 12) {
      result.push(twoDigit)
      i += 2
      continue
    }

    const oneDigit = Number(raw[i])
    if (oneDigit >= 1 && oneDigit <= 9) {
      result.push(oneDigit)
      i += 1
      continue
    }

    throw new Error(`Invalid PRACTICAL HOURS value: ${hours}`)
  }

  return result
}

/* ---------------- NORMALIZER ---------------- */

export function normalizeMasterTT(rows: RawRow[]): MasterCourse[] {
  const courseMap = new Map<string, MasterCourse>()

  for (const row of rows) {
    const rawHours = row["HOUR S"]

    if (!row.DAYS || rawHours == null) continue

    if (!courseMap.has(row["COURSE NO."])) {
      courseMap.set(row["COURSE NO."], {
        courseCode: row["COURSE NO."],
        courseTitle: row["COURSE TITLE"],
        credits: row.U,
        sections: [],
      })
    }

    const course = courseMap.get(row["COURSE NO."])!

    let section = course.sections.find(s => s.section === row.SEC)
    if (!section) {
      section = {
        section: row.SEC,
        type: getType(row.SEC),
        instructors: [],
        sessions: [],
      }
      course.sections.push(section)
    }

    /* ---- instructors ---- */
    row["INSTRUCTOR_IN_CHARGE/INS TRUCTOR"]
      .split(",")
      .map(i => i.trim())
      .filter(Boolean)
      .forEach(i => {
        if (!section!.instructors.includes(i)) {
          section!.instructors.push(i)
        }
      })

    /* ---- sessions ---- */
    const days = parseDays(row.DAYS)
    const hours = parseHours(rawHours, section.type)

    for (const d of days) {
      for (const h of hours) {
        const time = HOUR_TIME_MAP[h]
        if (!time) continue

        section.sessions.push({
          day: d,
          hour: h,
          startTime: time.start,
          endTime: time.end,
          room: row.ROOM,
        })
      }
    }
  }

  return Array.from(courseMap.values())
}
