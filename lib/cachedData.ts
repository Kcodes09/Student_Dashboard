/**
 * Cached data fetching utilities.
 * Uses Next.js `unstable_cache` to deduplicate and cache DB queries
 * across multiple page renders per request.
 */

import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"

/**
 * Fetch the user's saved timetable from DB.
 * Cached per-user for 60 seconds (revalidated on save).
 */
export const getCachedTimetable = (email: string) =>
  unstable_cache(
    () =>
      prisma.timetable.findUnique({
        where: { userEmail: email },
        select: { data: true },
      }),
    ["timetable", email],
    { revalidate: 60, tags: [`timetable-${email}`] }
  )()

/**
 * Fetch the user's attendance records from DB.
 * Cached per-user for 30 seconds.
 */
export const getCachedAttendance = (email: string) =>
  unstable_cache(
    () =>
      prisma.attendance.findMany({
        where: { userEmail: email },
        select: { courseCode: true, id: true, date: true },
      }),
    ["attendance", email],
    { revalidate: 30, tags: [`attendance-${email}`] }
  )()

/**
 * Fetch the user's exams from DB.
 * Cached per-user for 60 seconds.
 */
export const getCachedExams = (email: string) =>
  unstable_cache(
    () =>
      prisma.exam.findMany({
        where: { userEmail: email },
      }),
    ["exams", email],
    { revalidate: 60, tags: [`exams-${email}`] }
  )()
