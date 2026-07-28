const fs = require("fs");
const academic_calendar = JSON.parse(fs.readFileSync("c:/Users/kesha/Documents/Projects_Webdev/Dashboard/student_dashboard_frontend/lib/data/academic_calendar.json"));
const calendarMap = new Map(academic_calendar.days.map(d => [d.date, d]));

function toLocalISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const compreBegin = academic_calendar.days.find(d => d.label?.toLowerCase().includes("comprehensive examinations begin"))?.date;
const compreEnd = academic_calendar.days.find(d => d.label?.toLowerCase().includes("comprehensive examinations end"))?.date;

const isExamPeriod = (d) => {
   const iso = toLocalISO(d)
   const label = calendarMap.get(iso)?.label?.toLowerCase() || ""
   if (label.includes("mid-semester")) return true
   if (compreBegin && compreEnd && iso >= compreBegin && iso <= compreEnd) return true
   return false
}

const isDayOff = (d) => {
   const iso = toLocalISO(d)
   if (calendarMap.get(iso)?.holiday) return true
   if (calendarMap.get(iso)?.label?.includes("VACATION")) return true
   return [0, 6].includes(d.getDay());
}

const days = [];
for(let i=1; i<=10; i++) {
   const d = new Date(2026, 9, i); // Oct i, 2026 (month is 0-indexed)
   let isOff = isDayOff(d);
   if (i === 2) isOff = true;
   days.push({ date: d, iso: toLocalISO(d), isOff: isOff });
}

let bestBlocks = [];
let leaveDays = 1;
for (let i = 0; i < days.length; i++) {
   let workingDays = 0
   let leavesUsedForThisWindow = []
   let j = i
   
   while (j < days.length) {
      if (isExamPeriod(days[j].date)) break;
      if (!days[j].isOff) {
         if (workingDays < leaveDays) {
            workingDays++
            leavesUsedForThisWindow.push(j)
         } else {
            break
         }
      }
      j++
   }
   
   const length = j - i
   if (length >= 3 + leaveDays) {
      bestBlocks.push({ startIdx: i, endIdx: j - 1, leavesUsed: [...leavesUsedForThisWindow] })
   }
}

console.log(bestBlocks.map(b => ({
  start: days[b.startIdx].iso,
  end: days[b.endIdx].iso,
  leaves: b.leavesUsed.map(idx => days[idx].iso)
})));
