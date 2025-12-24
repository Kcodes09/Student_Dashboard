import XLSX from "xlsx"

const INPUT = "DRAFT TIMETABLE II SEM 2025 -26.xlsx"
const OUTPUT = "DRAFT_TIMETABLE_CLEANED.xlsx"

const workbook = XLSX.readFile(INPUT)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
  header: 1,
  defval: "",
})

// Skip title rows — first row is title, second row is headers
const headerRow = rows[1]
const dataRows = rows.slice(2)

// 🔍 Find column indexes by keyword (robust)
const findCol = (keyword: string) =>
  headerRow.findIndex(
    (h: string) => typeof h === "string" && h.toUpperCase().includes(keyword)
  )

const INSTRUCTOR_COL = findCol("INSTRUCTOR")
const DAYS_COL = findCol("DAY")
const HOURS_COL = findCol("HOUR")

if (INSTRUCTOR_COL === -1 || DAYS_COL === -1 || HOURS_COL === -1) {
  console.error("Detected headers:", headerRow)
  throw new Error("Required columns not found")
}

const cleaned: any[] = []
let lastTeachingRow: any[] | null = null

for (const row of dataRows) {
  const instructor = row[INSTRUCTOR_COL]
  const days = row[DAYS_COL]
  const hours = row[HOURS_COL]

  const isInstructorOnly =
    instructor &&
    String(instructor).trim() !== "" &&
    String(days).trim() === "" &&
    String(hours).trim() === ""

  if (isInstructorOnly && lastTeachingRow) {
    lastTeachingRow[INSTRUCTOR_COL] =
      lastTeachingRow[INSTRUCTOR_COL]
        ? `${lastTeachingRow[INSTRUCTOR_COL]}, ${instructor}`
        : instructor
    continue
  }

  cleaned.push(row)
  lastTeachingRow = row
}

// Write cleaned Excel
const newSheet = XLSX.utils.aoa_to_sheet([headerRow, ...cleaned])
const newWorkbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(newWorkbook, newSheet, "CLEANED")

XLSX.writeFile(newWorkbook, OUTPUT)

console.log("✅ Cleaned Excel generated:", OUTPUT)
