import XLSX from "xlsx";

const MONTH_MAP: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
};

function expandDateCell(cell: string, year: number): string[] {
  if (!cell || typeof cell !== "string") return [];

  // Remove weekday markers (M), (F), (Su) etc.
  let clean = cell.replace(/\([^)]*\)/g, "").trim();
  clean = clean.replace(/\s+/g, " ");

  const rangeDelimiters = [/—/, /–/, /-/, /\bto\b/i];
  for (const d of rangeDelimiters) {
    if (d.test(clean)) {
      const parts = clean.split(d).map(p => p.trim());
      if (parts.length === 2) {
        const [startStr, endStr] = parts;
        const startMatch = startStr.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
        if (!startMatch) continue;
        const [, startMonthName, startDayStr] = startMatch;
        const startMonthIndex = MONTH_MAP[startMonthName];
        if (startMonthIndex === undefined) continue;
        const startDay = Number(startDayStr);

        let endMonthName = startMonthName;
        let endDayStr = "";

        if (/^\d{1,2}$/.test(endStr)) {
          endDayStr = endStr;
        } else {
          const endMatch = endStr.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
          if (endMatch) {
            [, endMonthName, endDayStr] = endMatch;
          } else {
            continue;
          }
        }

        const endMonthIndex = MONTH_MAP[endMonthName];
        if (endMonthIndex === undefined) continue;
        const endDay = Number(endDayStr);

        let startYear = year;
        let endYear = year;
        if (startMonthIndex > endMonthIndex) {
          endYear = year + 1;
        }

        const startDate = new Date(Date.UTC(startYear, startMonthIndex, startDay));
        const endDate = new Date(Date.UTC(endYear, endMonthIndex, endDay));

        const dates: string[] = [];
        const current = new Date(startDate);
        while (current <= endDate) {
          dates.push(current.toISOString().slice(0, 10));
          current.setDate(current.getDate() + 1);
        }
        return dates;
      }
    }
  }

  const singleMatch = clean.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  if (singleMatch) {
    const [, monthName, dayStr] = singleMatch;
    const monthIndex = MONTH_MAP[monthName];
    if (monthIndex !== undefined) {
      const d = new Date(Date.UTC(year, monthIndex, Number(dayStr)));
      return [d.toISOString().slice(0, 10)];
    }
  }

  return [];
}

const workbook = XLSX.readFile("Academic Calendar _ 2026-27.xlsx");
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log(`\n================= ${sheetName} =================`);
  const yearForSheet = sheetName === "Table 1" ? 2026 : 2027;
  for (const row of rows) {
    const rawDate = row[0];
    const event = row[1];
    if (!rawDate || rawDate.startsWith("*")) continue;
    const res = expandDateCell(rawDate, yearForSheet);
    console.log(`Raw: "${rawDate}" -> Clean: "${rawDate.replace(/\([^)]*\)/g, "").trim()}" -> Result:`, res);
  }
}
