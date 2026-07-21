import fs from "fs"
import XLSX from "xlsx"
import { normalizeMasterTT } from "../app/lib/timetable/normalizeMasterTT.js"

const INPUT = "data/forward_filled_tt.xlsx"
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
    let key = headerRow[i]
    if (key) {
      key = key.trim()
      if (key.includes("INSTRUCTOR")) {
        key = "INSTRUCTOR_IN_CHARGE/INS TRUCTOR"
      } else if (key === "HOURS" || key === "HOUR S") {
        key = "HOUR S"
      } else if (key === "SE C" || key === "SEC") {
        key = "SEC"
      }
      obj[key] = row[i]
    }
  }
  return obj
})

// 🔹 Forward-fill merged cells
const filledRows = []
let last: any = {}

for (const row of cleanedRows) {
  const filled = { ...row }

  // If this is a NEW course, don't inherit schedule/section from the previous course
  if (row["COURSE NO."] && String(row["COURSE NO."]).trim() !== "") {
    last["SEC"] = ""
    last["DAYS"] = ""
    last["HOUR S"] = ""
    last["ROOM"] = ""
  }

  for (const key of Object.keys(row)) {
    if (row[key] === "") {
      filled[key] = last[key]
    }
  }

  if (filled["HOUR S"] !== undefined && filled["HOUR S"] !== null) {
    filled["HOUR S"] = String(filled["HOUR S"]).replace(/,/g, "").trim()
  }

  last = filled
  filledRows.push(filled)
}

// 🔹 Normalize
const master = normalizeMasterTT(filledRows)

fs.mkdirSync("data", { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify(master, null, 2))

console.log(`✅ mastertt.json generated with ${master.length} entries`)
