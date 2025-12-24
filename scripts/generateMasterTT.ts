import fs from "fs"
import XLSX from "xlsx"
import { normalizeMasterTT } from "../app/lib/timetable/normalizeMasterTT.js"

const INPUT = "forward_filled_timetable.xlsx"
const OUTPUT = "data/mastertt.json"

const workbook = XLSX.readFile(INPUT)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const raw = XLSX.utils.sheet_to_json<any>(sheet, {
  header: 1,
  defval: "",
})

// 🔹 First row contains ACTUAL column names
const headerRow = raw[0]
const dataRows = raw.slice(1)

// 🔹 Build clean objects with real keys
const cleanedRows = dataRows.map((row) => {
  const obj: any = {}
  for (let i = 0; i < headerRow.length; i++) {
    const key = headerRow[i]
    if (key) obj[key.trim()] = row[i]
  }
  return obj
})

// 🔹 Forward-fill merged cells
const filledRows = []
let last: any = {}

for (const row of cleanedRows) {
  const filled = { ...row }

  for (const key of Object.keys(row)) {
    if (row[key] === "") {
      filled[key] = last[key]
    }
  }

  last = filled
  filledRows.push(filled)
}

// 🔹 Normalize
const master = normalizeMasterTT(filledRows)

fs.mkdirSync("data", { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify(master, null, 2))

console.log(`✅ mastertt.json generated with ${master.length} entries`)
