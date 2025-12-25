import  XLSX from "xlsx"
import path from "path"
import fs from "fs"

type Row = Record<string, any>

/* ---------- CONFIG ---------- */
const INPUT = "DRAFT_TIMETABLE_CLEANED.xlsx"
const OUTPUT = "forward_filled_tt.xlsx"

const EXAM_COLS = ["Midsem", "Endsem"]

/* ---------- LOAD ---------- */
const inputPath = path.join(process.cwd(), "data", INPUT)
const wb = XLSX.readFile(inputPath)
const sheetName = wb.SheetNames[0]
const sheet = wb.Sheets[sheetName]
const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" })

/* ---------- FORWARD FILL ---------- */
let prevRow: Row | null = null

const filledRows = rows.map(row => {
  const examEmpty = EXAM_COLS.every(c => !row[c])
  const nonExamEmpty = Object.keys(row)
    .filter(k => !EXAM_COLS.includes(k))
    .some(k => !row[k])

  // ❌ Only exam empty → DO NOT FILL
  if (examEmpty && !nonExamEmpty) {
    prevRow = row
    return row
  }

  // ✅ Forward fill allowed
  if (prevRow) {
    for (const key of Object.keys(row)) {
      if (!row[key]) {
        row[key] = prevRow[key]
      }
    }
  }

  prevRow = row
  return row
})

/* ---------- WRITE ---------- */
const outSheet = XLSX.utils.json_to_sheet(filledRows)
const outWB = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(outWB, outSheet, "ForwardFilled")

const outPath = path.join(process.cwd(), "data", OUTPUT)
XLSX.writeFile(outWB, outPath)

console.log("✅ Forward-filled timetable generated")
