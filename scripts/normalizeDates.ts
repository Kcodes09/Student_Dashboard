import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

type Exam = {
  courseCode: string
  courseTitle: string
  type: string
  date: string
  startTime: string
  endTime: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, "..")
const dataDir = path.join(projectRoot, "lib", "data")

const inputPath = path.join(dataDir, "exams_normalized_fixed.json")
const outputPath = path.join(dataDir, "exams_normalized.json")

const exams: Exam[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"))

const normalizeDate = (date: string, index: number): string => {
  if (!date) {
    console.warn(`⚠️ Empty date at index ${index}`)
    return date
  }

  // Accepts 1/2, 01/02, 1-2, 01-02
  const match = date.match(/^(\d{1,2})[\/-](\d{1,2})$/)

  if (!match) {
    console.warn(`⚠️ Invalid date format "${date}" at index ${index}`)
    return date
  }

  const [, day, month] = match

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}`
}

const fixedExams = exams.map((exam, i) => ({
  ...exam,
  date: normalizeDate(exam.date, i),
}))

fs.writeFileSync(outputPath, JSON.stringify(fixedExams, null, 2))

console.log("✅ Date normalization completed with validation")
