import XLSX from "xlsx"

const INPUT = "DRAFT_TIMETABLE_CLEANED.xlsx"
const OUTPUT = "DRAFT_TIMETABLE_FLAT.xlsx"

const workbook = XLSX.readFile(INPUT)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
  header: 1,
  defval: "",
})

const header = rows[0]
const data = rows.slice(1)

const filled: any[] = []
let last: any[] = [...header]

for (const row of data) {
  const newRow = row.map((cell, i) =>
    cell === "" ? last[i] : cell
  )
  filled.push(newRow)
  last = newRow
}

const newSheet = XLSX.utils.aoa_to_sheet([header, ...filled])
const newWorkbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(newWorkbook, newSheet, "FLAT")

XLSX.writeFile(newWorkbook, OUTPUT)

console.log("✅ Forward-filled Excel generated:", OUTPUT)
