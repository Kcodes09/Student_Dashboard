import fs from "fs"
import path from "path"

const INPUT = path.join(process.cwd(), "lib/data/exams_array.json")
const OUTPUT = path.join(process.cwd(), "lib/data/exams_normalized.json")

type RawExam = {
  courseCode: string
  courseTitle: string
  type: "MIDSEM" | "ENDSEM"
  dateTime: string
}

type Exam = {
  courseCode: string
  courseTitle: string
  type: "MIDSEM" | "ENDSEM"
  date: string
  startTime: string
  endTime: string
}

const FN_TIME = { start: "09:30", end: "12:30" }
const AN_TIME = { start: "14:00", end: "17:00" }

function normalizeTime(t: string) {
  return t.replace(".", ":").replace(/AM|PM/i, "").trim()
}

const raw: RawExam[] = JSON.parse(fs.readFileSync(INPUT, "utf-8"))

const exams: Exam[] = raw.map(e => {
  // Case 1: Explicit time
  if (e.dateTime.includes("-") && e.dateTime.includes(".")) {
    const [date, start, end] = e.dateTime.split("-").map(s => s.trim())

    return {
      courseCode: e.courseCode,
      courseTitle: e.courseTitle,
      type: e.type,
      date,
      startTime: normalizeTime(start),
      endTime: normalizeTime(end),
    }
  }

  // Case 2: FN / AN
  const [date, session] = e.dateTime.split(" ")

  const time =
    session === "FN" ? FN_TIME : AN_TIME

  return {
    courseCode: e.courseCode,
    courseTitle: e.courseTitle,
    type: e.type,
    date,
    startTime: time.start,
    endTime: time.end,
  }
})

fs.writeFileSync(OUTPUT, JSON.stringify(exams, null, 2))

console.log("✅ exams_normalized.json generated")
