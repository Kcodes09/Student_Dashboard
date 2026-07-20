export type ClashSession = {
  day: string
  startTime: string
  endTime: string
  courseCode: string
  section: string
  type?: string
}

export type ClashInfo = {
  day: string
  timeStr: string // e.g. "08:00 - 08:50"
  course1: string
  section1: string
  course2: string
  section2: string
}

// Convert "HH:MM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return 0
  return h * 60 + m
}

export function findClashes(sessions: ClashSession[]): ClashInfo[] {
  const clashes: ClashInfo[] = []
  if (!sessions || sessions.length < 2) return clashes

  // Group by day
  const byDay: Record<string, ClashSession[]> = {}
  for (const s of sessions) {
    if (!byDay[s.day]) byDay[s.day] = []
    byDay[s.day].push(s)
  }

  // Check overlaps per day
  for (const day of Object.keys(byDay)) {
    const daySessions = byDay[day]
    
    // Sort by start time for easier overlap checking
    daySessions.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

    for (let i = 0; i < daySessions.length; i++) {
      for (let j = i + 1; j < daySessions.length; j++) {
        const s1 = daySessions[i]
        const s2 = daySessions[j]
        
        // Skip identical courses/sections (just in case mastertt has duplicates)
        if (s1.courseCode === s2.courseCode && s1.section === s2.section) continue

        const start1 = timeToMinutes(s1.startTime)
        const end1 = timeToMinutes(s1.endTime)
        const start2 = timeToMinutes(s2.startTime)
        const end2 = timeToMinutes(s2.endTime)

        // Check if periods overlap (exclusive of exact boundaries)
        if (start1 < end2 && end1 > start2) {
          clashes.push({
            day,
            timeStr: `${s1.startTime}-${s1.endTime} / ${s2.startTime}-${s2.endTime}`,
            course1: s1.courseCode,
            section1: s1.section,
            course2: s2.courseCode,
            section2: s2.section,
          })
        }
      }
    }
  }

  return clashes
}

export function checkSectionClash(
  sectionSessions: { day: string; startTime: string; endTime: string }[],
  courseCode: string,
  sectionType: string,
  currentSessions: ClashSession[]
): ClashInfo | null {
  for (const s1 of sectionSessions) {
    const start1 = timeToMinutes(s1.startTime)
    const end1 = timeToMinutes(s1.endTime)

    for (const s2 of currentSessions) {
      if (s2.day !== s1.day) continue
      // If evaluating a section, it replaces the existing section of the same course and type, so ignore it
      if (s2.courseCode === courseCode && s2.type === sectionType) continue

      const start2 = timeToMinutes(s2.startTime)
      const end2 = timeToMinutes(s2.endTime)

      if (start1 < end2 && end1 > start2) {
        return {
          day: s1.day,
          timeStr: `${s1.startTime}-${s1.endTime} / ${s2.startTime}-${s2.endTime}`,
          course1: courseCode,
          section1: "New",
          course2: s2.courseCode,
          section2: s2.section,
        }
      }
    }
  }
  return null
}

export function checkCourseClash(
  course: any,
  currentSessions: ClashSession[]
): boolean {
  if (!course || !course.sections || currentSessions.length === 0) return false

  // Group course sections by type (LECTURE, TUTORIAL, PRACTICAL)
  const byType: Record<string, any[]> = {}
  for (const sec of course.sections) {
    if (!byType[sec.type]) byType[sec.type] = []
    byType[sec.type].push(sec)
  }

  // A course "clashes completely" if for ANY REQUIRED type, ALL available sections clash
  // Because if even one type has no valid sections, you can't take the course.
  for (const type of Object.keys(byType)) {
    const sectionsOfType = byType[type]
    let allClash = true
    for (const sec of sectionsOfType) {
      const isClash = checkSectionClash(sec.sessions, course.courseCode, sec.type, currentSessions)
      if (!isClash) {
        allClash = false
        break
      }
    }
    if (allClash && sectionsOfType.length > 0) {
      return true
    }
  }

  return false
}

// ---- CDC CLASH DETECTION ----

function getValidConfigs(course: any) {
  if (!course || !course.sections) return [];
  const byType: Record<string, any[]> = {};
  for (const sec of course.sections) {
    if (!byType[sec.type]) byType[sec.type] = [];
    byType[sec.type].push(sec);
  }
  const types = Object.keys(byType);
  if (types.length === 0) return [];
  
  let configs: any[][] = [[]];
  for (const t of types) {
    const newConfigs: any[][] = [];
    for (const config of configs) {
      for (const sec of byType[t]) {
        newConfigs.push([...config, sec]);
      }
    }
    configs = newConfigs;
  }
  return configs;
}

function configsClash(config1: any[], config2: any[]) {
  for (const sec1 of config1) {
    for (const sec2 of config2) {
      for (const s1 of sec1.sessions) {
        for (const s2 of sec2.sessions) {
          if (s1.day === s2.day) {
            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime);
            if (start1 < end2 && end1 > start2) return true;
          }
        }
      }
    }
  }
  return false;
}

function doAnySectionsClash(course1: any, course2: any) {
  for (const sec1 of course1.sections || []) {
    for (const sec2 of course2.sections || []) {
      for (const s1 of sec1.sessions) {
        for (const s2 of sec2.sessions) {
          if (s1.day === s2.day) {
            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime);
            if (start1 < end2 && end1 > start2) return true;
          }
        }
      }
    }
  }
  return false;
}

export function getCDCClashes(course: any, cdcCourses: any[]) {
  const definite: string[] = [];
  const possible: string[] = [];

  const configs1 = getValidConfigs(course);

  for (const cdc of cdcCourses) {
    if (cdc.courseCode === course.courseCode) continue;

    // VERY FAST EARLY EXIT (O(n^2) instead of O(n!))
    if (!doAnySectionsClash(course, cdc)) {
      continue;
    }

    const configs2 = getValidConfigs(cdc);

    let anyValid = false;
    let anyClash = false;

    for (const c1 of configs1) {
      for (const c2 of configs2) {
        if (configsClash(c1, c2)) {
          anyClash = true;
        } else {
          anyValid = true;
        }
        if (anyClash && anyValid) break;
      }
      if (anyClash && anyValid) break;
    }

    if (anyClash && !anyValid) {
      definite.push(cdc.courseCode);
    } else if (anyClash && anyValid) {
      possible.push(cdc.courseCode);
    }
  }

  return { definite, possible };
}
