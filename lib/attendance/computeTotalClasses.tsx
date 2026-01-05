import type { Session, WeekDay } from "@/types/timetable"

type CalendarDay = {
  date: string
  label?: string
  holiday?: boolean
}

function getWeekDayFromDate(date: Date): WeekDay | null {
  const map: Record<number, WeekDay> = {
    1: "M",
    2: "T",
    3: "W",
    4: "Th",
    5: "F",
    6: "S",
  }
  return map[date.getDay()] ?? null
}

function findDateByLabel(
  calendar: CalendarDay[],
  keyword: string
): Date | null {
  const day = calendar.find(d =>
    d.label?.toLowerCase().includes(keyword)
  )
  return day ? new Date(day.date) : null
}

export function computeTotalClassesForCourse({
  courseCode,
  sessions,
  calendar,
}: {
  courseCode: string
  sessions: Session[]
  calendar: CalendarDay[]
}) {
  const startDate = findDateByLabel(
    calendar,
    "classwork"
  )
  const endDate = findDateByLabel(
    calendar,
    "compre"
  )

  if (!startDate || !endDate) return 0

  let count = 0

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const iso = d.toISOString().slice(0, 10)
    const meta = calendar.find(c => c.date === iso)

    // ❌ Skip Sundays
    if (d.getDay() === 0) continue

    // ❌ Skip holidays
    if (meta?.holiday) continue

    // ❌ Skip midsems
    if (meta?.label?.toLowerCase().includes("midsem"))
      continue

    const weekday = getWeekDayFromDate(d)
    if (!weekday) continue

    // ✅ Count sessions for this course on this weekday
    count += sessions.filter(
      s =>
        s.courseCode === courseCode &&
        s.day === weekday
    ).length
  }

  return count
}
