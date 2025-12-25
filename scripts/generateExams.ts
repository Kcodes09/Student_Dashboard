import fs from "fs"
import path from "path"
import XLSX from "xlsx"


// ---------- PATHS ----------
const XLSX_PATH = path.join(
  process.cwd(),
  "forward_filled_timetable.xlsx"
)

const OUTPUT_PATH = path.join(
  process.cwd(),
  "lib/data/exams.json"
)

// ---------- READ EXCEL ----------
const workbook = XLSX.readFile(XLSX_PATH)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]

const rows = XLSX.utils.sheet_to_json<any>(sheet)

// ---------- BUILD EXAMS ----------
const exams: Record<
  string,
  {
    courseTitle: string
    midsem: string
    endsem: string
  }
> = {}

for (const row of rows) {
  const courseCode = row["COURSE NO."]?.trim()
  if (!courseCode || exams[courseCode]) continue

  exams[courseCode] = {
    courseTitle: String(row["COURSE TITLE"] ?? "").trim(),
    midsem: String(row["MIDSEM"] ?? "").trim(),
    endsem: String(row["ENDSEM"] ?? "").trim(),
  }
}

// ---------- WRITE JSON ----------
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(exams, null, 2))

console.log("✅ exams.json generated successfully")
