import fs from "fs"
import path from "path"

const INPUT = path.join(process.cwd(), "lib/data/exams.json")
const OUTPUT = path.join(process.cwd(), "lib/data/exams_array.json")

const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"))

type Exam = {
  courseCode: string
  courseTitle: string
  type: "MIDSEM" | "ENDSEM"
  dateTime: string
}

const exams: Exam[] = []

for (const courseCode in raw) {
  const { courseTitle, midsem, endsem } = raw[courseCode]

  if (midsem) {
    exams.push({
      courseCode,
      courseTitle,
      type: "MIDSEM",
      dateTime: midsem,
    })
  }

  if (endsem) {
    exams.push({
      courseCode,
      courseTitle,
      type: "ENDSEM",
      dateTime: endsem,
    })
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(exams, null, 2))

console.log("✅ exams_array.json generated")
