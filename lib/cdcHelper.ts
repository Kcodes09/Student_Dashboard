import cdcData from "../data/cdcs.json"

export type CDC = { code: string; title: string }

const BRANCH_MAP: Record<string, { type: "BE" | "MSc"; branch: string }> = {
  A1: { type: "BE", branch: "Chemical" },
  A2: { type: "BE", branch: "Civil" },
  A3: { type: "BE", branch: "Electrical & Electronics" },
  A4: { type: "BE", branch: "Mechanical" },
  A5: { type: "BE", branch: "Pharmacy" },
  A7: { type: "BE", branch: "Computer Science" },
  A8: { type: "BE", branch: "Electronics & Instrumentation" },
  A9: { type: "BE", branch: "Biotechnology" },
  AA: { type: "BE", branch: "Electronics & Communication" },
  AB: { type: "BE", branch: "Manufacturing" },
  AC: { type: "BE", branch: "Electronics & Computer Engineering" },
  AD: { type: "BE", branch: "Mathematics and Computing" },
  AE: { type: "BE", branch: "Architecture and Urban Engineering" },
  AF: { type: "BE", branch: "Chemical with Specialization in Energy, Environment, and Sustainability" },
  AJ: { type: "BE", branch: "Environmental and Sustainability Engineering" },
  B1: { type: "MSc", branch: "Biological Sciences" },
  B2: { type: "MSc", branch: "Chemistry" },
  B3: { type: "MSc", branch: "Economics" },
  B4: { type: "MSc", branch: "Mathematics" },
  B5: { type: "MSc", branch: "Physics" },
  B7: { type: "MSc", branch: "Semiconductor and Nanoscience" },
}

export function parseBitsId(idNumber: string) {
  const idStr = idNumber.trim().toUpperCase()
  if (idStr.length < 8) return null
  const yearStr = idStr.substring(0, 4)
  const year = parseInt(yearStr)
  if (isNaN(year)) return null

  const codesStr = idStr.substring(4, 8)
  const code1 = codesStr.substring(0, 2)
  const code2 = codesStr.substring(2, 4)

  const branches: Array<{ type: "BE" | "MSc"; branch: string }> = []
  if (BRANCH_MAP[code1]) branches.push(BRANCH_MAP[code1])
  if (BRANCH_MAP[code2]) branches.push(BRANCH_MAP[code2])

  if (branches.length === 0 && year < 2000) return null

  // Assuming current academic year starts Aug 2026
  const isYear1 = year >= 2026

  return { year, isYear1, branches }
}

/** Regex that matches Year-1 (UXXX) course codes like "CS U111", "MATH U101". */
export const YEAR1_UXXX_PATTERN = /^[A-Z]+ U\d{3}$/

/**
 * UXXX courses that are CDCs **only** for B.Pharm (branch code A5).
 */
export const BPHARM_ONLY_UXXX = new Set(["PHY U102", "MATH U110"])

/**
 * Group-based CDC lists for 2026 batch (non-B.Pharm).
 *
 * Sem 1 —
 *   Group 1: MATH U101, MATH U113, PHY U101, PHY U110, EEE U111, BITS U103  (17 Cr)
 *   Group 2: MATH U101, MATH U113, CHEM U101, CHEM U110, BIO U101, CS U111  (17 Cr)
 *
 * Sem 2 — (vice versa)
 *   Group 1: MATH U102, CHEM U101, CHEM U110, BIO U101, CS U111
 *   Group 2: MATH U102, PHY U101, PHY U110, EEE U111, BITS U103
 */
export const YEAR1_GROUPS: Record<"group1" | "group2", { sem1: string[]; sem2: string[] }> = {
  group1: {
    sem1: ["MATH U101", "MATH U113", "PHY U101", "PHY U110", "EEE U111", "BITS U103"],
    sem2: ["MATH U102", "CHEM U101", "CHEM U110", "BIO U101", "CS U111"],
  },
  group2: {
    sem1: ["MATH U101", "MATH U113", "CHEM U101", "CHEM U110", "BIO U101", "CS U111"],
    sem2: ["MATH U102", "PHY U101", "PHY U110", "EEE U111", "BITS U103"],
  },
}

/**
 * Returns true when the bitsId belongs to the 2026 batch (Year 1).
 */
export function isYear1Batch(idNumber: string): boolean {
  const parsed = parseBitsId(idNumber)
  return !!parsed?.isYear1
}

/**
 * Returns CDC course codes for a 2026-batch student.
 * - B.Pharm: all UXXX courses
 * - Others with a group selected: courses for that group's sem1 (or sem2)
 * - Others with no group: only the shared courses (MATH U101 + MATH U113)
 */
export function getYear1Cdcs(
  idNumber: string,
  availableCodes: Set<string>,
  group?: "group1" | "group2",
  sem: "sem1" | "sem2" = "sem1"
): string[] {
  const parsed = parseBitsId(idNumber)
  if (!parsed?.isYear1) return []

  const isBPharm = parsed.branches.some(b => b.branch === "Pharmacy")

  if (isBPharm) {
    // B.Pharm gets all UXXX courses
    return Array.from(availableCodes)
      .filter(code => YEAR1_UXXX_PATTERN.test(code))
      .sort()
  }

  if (!group) {
    // No group chosen yet — return only the courses common to both groups
    const shared = new Set([
      ...YEAR1_GROUPS.group1[sem],
      ...YEAR1_GROUPS.group2[sem],
    ].filter(c =>
      YEAR1_GROUPS.group1[sem].includes(c) &&
      YEAR1_GROUPS.group2[sem].includes(c)
    ))
    return Array.from(shared).filter(c => availableCodes.has(c)).sort()
  }

  return (YEAR1_GROUPS[group][sem] ?? []).filter(c => availableCodes.has(c))
}

export function inferSemesterKey(parsed: ReturnType<typeof parseBitsId>) {
  if (!parsed) return "year2_sem1"

  const isDual =
    parsed.branches.some((b) => b.type === "MSc") &&
    parsed.branches.some((b) => b.type === "BE")

  if (parsed.isYear1) {
    return "sem1"
  } else {
    const currentYear = 2026 // Assuming Fall 2026
    const yearDiff = currentYear - parsed.year
    if (yearDiff === 1) return "year2_sem1"
    else if (yearDiff === 2) return "year3_sem1"
    else if (yearDiff === 3 && isDual) return "year4_sem1"
    else return "year2_sem1" // Fallback
  }
}

export function getCdcsForId(idNumber: string, manualSemKey?: string): CDC[] {
  const parsed = parseBitsId(idNumber)
  if (!parsed) return []

  const isDual =
    parsed.branches.some((b) => b.type === "MSc") &&
    parsed.branches.some((b) => b.type === "BE")

  const selectedSemKey = manualSemKey || inferSemesterKey(parsed)

  const list: CDC[] = []
  const seen = new Set<string>()
  const previousCdcs = new Set<string>()

  const semOrder = [
    "sem1",
    "sem2",
    "year2_sem1",
    "year2_sem2",
    "year3_sem1",
    "year3_sem2",
    "year4_sem1",
    "year4_sem2",
  ]

  const EQUIVALENCE_GROUPS = [
    ["ECON F211", "MGTS F211"],
    ["ECE F212", "EEE F212", "INSTR F212", "PHY F212"],
  ]

  const EQUIVALENCE_TITLES: Record<string, string> = {
    "ECON F211": "Principles of Economics",
    "MGTS F211": "Principles of Management",
    "ECE F212": "Electromagnetic Theory",
    "EEE F212": "Electromagnetic Theory",
    "INSTR F212": "Electromagnetic Theory",
    "PHY F212": "Electromagnetic Theory I",
  }

  const getEquivalents = (code: string) => {
    for (const group of EQUIVALENCE_GROUPS) {
      if (group.includes(code)) return group.filter((c) => c !== code)
    }
    return []
  }

  // Find previous CDCs to avoid duplicates in upper years
  if (!parsed.isYear1) {
    const currentIndex = semOrder.indexOf(selectedSemKey)
    if (currentIndex > 0) {
      for (let i = 0; i < currentIndex; i++) {
        const prevSem = semOrder[i]

        if (prevSem === "sem1" || prevSem === "sem2") {
          const year1Data = (cdcData.year_1 as any)[prevSem]
          if (year1Data) {
            year1Data.forEach((c: CDC) => {
              previousCdcs.add(c.code)
              getEquivalents(c.code).forEach((eq) => previousCdcs.add(eq))
            })
          }
          continue
        }

        const match = prevSem.match(/year(\d+)_sem(\d+)/)
        if (match) {
          const pYear = parseInt(match[1])
          const pSem = match[2]

          for (const b of parsed.branches) {
            let actualPYearKey = prevSem

            if (isDual && b.type === "BE") {
              const effectiveBeYear = pYear - 1
              if (effectiveBeYear < 2) continue
              actualPYearKey = `year${effectiveBeYear}_sem${pSem}`
            }

            const pBranchData = (cdcData as any)[b.type]?.[b.branch]
            if (pBranchData && pBranchData[actualPYearKey]) {
              pBranchData[actualPYearKey].forEach((c: CDC) => {
                previousCdcs.add(c.code)
                getEquivalents(c.code).forEach((eq) => previousCdcs.add(eq))
              })
            }
          }
        }
      }
    }
  }

  const addCdcs = (arr: CDC[]) => {
    if (!arr) return
    for (const c of arr) {
      if (!seen.has(c.code) && !previousCdcs.has(c.code)) {
        seen.add(c.code)
        list.push(c)

        getEquivalents(c.code).forEach((eq) => {
          if (!seen.has(eq) && !previousCdcs.has(eq)) {
            seen.add(eq)
            list.push({ code: eq, title: EQUIVALENCE_TITLES[eq] || c.title })
          }
        })
      }
    }
  }

  if (parsed.isYear1) {
    if (selectedSemKey === "sem1" || selectedSemKey === "sem2") {
      addCdcs((cdcData.year_1 as any)[selectedSemKey])
    }
  } else {
    if (selectedSemKey.startsWith("year")) {
      const match = selectedSemKey.match(/year(\d+)_sem(\d+)/)
      if (match) {
        const targetYear = parseInt(match[1])
        const targetSem = match[2]

        for (const b of parsed.branches) {
          let actualYearKey = selectedSemKey

          if (isDual && b.type === "BE") {
            // Dual degree BE courses are shifted by 1 year
            const effectiveBeYear = targetYear - 1
            if (effectiveBeYear < 2) continue
            actualYearKey = `year${effectiveBeYear}_sem${targetSem}`
          }

          const branchData = (cdcData as any)[b.type]?.[b.branch]
          if (branchData && branchData[actualYearKey]) {
            addCdcs(branchData[actualYearKey])
          }
        }
      }
    }
  }
  
  return list
}
