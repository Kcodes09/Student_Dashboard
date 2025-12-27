import  XLSX from "xlsx"
import fs from "fs"

const INPUT_FILE = "academic_calendar_expanded.xlsx"
const OUTPUT_FILE = "lib/data/academic_calendar.json"

const workbook = XLSX.readFile(INPUT_FILE)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  raw: false,
})

const days = rows
  .slice(1) // skip header
  .filter(r => r[0])
  .map(row => ({
    date: row[0],
    label: row[1] ?? "",
    holiday: typeof row[1] === "string" && row[1].includes("(H)"),
  }))

const json = {
  year: 2026,
  days,
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 2))
console.log("✅ academic_calendar.json generated")
