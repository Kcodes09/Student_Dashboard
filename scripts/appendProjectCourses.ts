import fs from "fs"
import XLSX from "xlsx"

const INPUT = "DRAFT TIMETABLE I SEM 2026 -27 (1).xlsx"
const OUTPUT = "data/mastertt.json"

const workbook = XLSX.readFile(INPUT)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const raw = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" })

// Columns: 1: COURSE NO., 2: COURSE TITLE, 5: U (Credits), 7: INSTRUCTOR, 9: DAYS, 10: HOURS
const projectCourses: any[] = []

for (let i = 2; i < raw.length; i++) {
  const row = raw[i]
  const courseCode = String(row[1] || "").trim()
  const title = String(row[2] || "").trim()
  const credits = row[5]
  const instructor = String(row[7] || "").trim()
  const days = String(row[9] || "").trim()
  const hours = String(row[10] || "").trim()

  if (!courseCode) continue

  // Project courses have empty or TBA days/hours
  if (days === "" || days === "TBA" || hours === "" || hours === "TBA") {
    // If it's a project course, it might already be in our projectCourses list from a previous row
    let existing = projectCourses.find(c => c.courseCode === courseCode)
    if (!existing) {
      existing = {
        courseCode,
        courseTitle: title,
        credits: String(credits),
        sections: []
      }
      projectCourses.push(existing)
    }

    // Add instructor as a section with no name
    if (instructor) {
      // Avoid duplicate instructor sections
      const hasInst = existing.sections.find((s: any) => s.instructors.includes(instructor))
      if (!hasInst) {
        existing.sections.push({
          section: "",
          type: "LECTURE", // Just give it LECTURE so UI treats it normally
          instructors: [instructor],
          sessions: []
        })
      }
    }
  }
}

// Now read existing mastertt.json
const existingMaster = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"))

// Remove any existing courses that match the project courses to avoid duplicates
const filteredMaster = existingMaster.filter((c: any) => !projectCourses.some(p => p.courseCode === c.courseCode))

// Append the new project courses
const finalMaster = [...filteredMaster, ...projectCourses]

fs.writeFileSync(OUTPUT, JSON.stringify(finalMaster, null, 2))

console.log(`✅ Appended ${projectCourses.length} project courses to mastertt.json`)
