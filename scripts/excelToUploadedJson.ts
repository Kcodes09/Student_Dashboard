import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

const INPUT = path.join(
  process.cwd(),
  "data",
  "forward_filled_timetable.xlsx"
)

const OUTPUT = path.join(
  process.cwd(),
  "data",
  "uploaded.json"
)

const workbook = XLSX.readFile(INPUT)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: "",   // keep empty cells explicit
})

fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2))

console.log(`✅ uploaded.json generated (${rows.length} rows)`)
