import  XLSX from "xlsx"

// -------- CONFIG --------
const INPUT_FILE = "jte_1766829771536.xlsx"
const OUTPUT_FILE = "academic_calendar_expanded.xlsx"
const YEAR = 2026
// ------------------------

const MONTH_MAP: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
}

function expandDateCell(cell: string, year = YEAR): string[] {
  if (!cell || typeof cell !== "string") return []

  // Remove weekday markers (M), (F), (Su) etc.
  const clean = cell.replace(/\([^)]*\)/g, "").trim()

  // RANGE: "February 20-February 22"
  const rangeMatch = clean.match(
    /^([A-Za-z]+)\s+(\d{1,2})\s*-\s*([A-Za-z]+)\s+(\d{1,2})$/
  )

  if (rangeMatch) {
    const [, startMonth, startDay, endMonth, endDay] = rangeMatch

    const startDate = new Date(
      year,
      MONTH_MAP[startMonth],
      Number(startDay)
    )
    const endDate = new Date(
      year,
      MONTH_MAP[endMonth],
      Number(endDay)
    )

    const dates: string[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      dates.push(current.toISOString().slice(0, 10))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  // SINGLE DATE
  const singleMatch = clean.match(
    /^([A-Za-z]+)\s+(\d{1,2})$/
  )

  if (singleMatch) {
    const [, month, day] = singleMatch
    const d = new Date(
      year,
      MONTH_MAP[month],
      Number(day)
    )
    return [d.toISOString().slice(0, 10)]
  }

  return []
}

// ---------- MAIN ----------

// Read workbook
const workbook = XLSX.readFile(INPUT_FILE)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

// Convert to rows (A & B)
const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  raw: false,
})

// Prepare expanded output
const outputRows: any[][] = [["date", "event"]]

for (const row of rows) {
  const rawDate = row[0]
  const event = row[1] ?? ""

  if (!rawDate) continue

  const expandedDates = expandDateCell(rawDate)

  for (const d of expandedDates) {
    outputRows.push([d, event])
  }
}

// Create new workbook
const newSheet = XLSX.utils.aoa_to_sheet(outputRows)
const newWorkbook = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
  newWorkbook,
  newSheet,
  "Expanded Calendar"
)

// Write output
XLSX.writeFile(newWorkbook, OUTPUT_FILE)

console.log(`✅ Generated ${OUTPUT_FILE}`)
