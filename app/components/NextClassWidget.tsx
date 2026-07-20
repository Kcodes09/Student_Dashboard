"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Session } from "../../types/timetable"

const DAY_MAP = ["Su", "M", "T", "W", "Th", "F", "S"]

// Convert "HH:MM" to minutes from midnight for easy comparison
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return 0
  return h * 60 + m
}

export default function NextClassWidget({ userExams = [] }: { userExams?: any[] }) {
  const router = useRouter()
  const [nextClass, setNextClass] = useState<Session | null>(null)
  const [upcomingExam, setUpcomingExam] = useState<any | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // 1. Check for upcoming exams (Today or Tomorrow)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayStr = now.toDateString()
    const tomorrowStr = tomorrow.toDateString()
    
    const currentMins = now.getHours() * 60 + now.getMinutes()
    let foundExam = null
    
    for (const e of userExams) {
      const examDate = new Date(e.date)
      const eStr = examDate.toDateString()
      
      if (eStr === todayStr) {
        // If today, make sure it hasn't passed
        if (timeToMinutes(e.startTime) > currentMins) {
          foundExam = { ...e, dayLabel: "Today" }
          break // Found a valid today exam, stop searching
        }
      } else if (eStr === tomorrowStr) {
        // If tomorrow, store it but keep looking for a 'today' exam
        if (!foundExam || foundExam.dayLabel !== "Today") {
          foundExam = { ...e, dayLabel: "Tomorrow" }
        }
      }
    }
    setUpcomingExam(foundExam)

    // 2. Find next class
    function findNextClass() {
      const raw = localStorage.getItem("student_dashboard_sessions")
      if (!raw) {
        setIsLoaded(true)
        return
      }

      try {
        const sessions = JSON.parse(raw) as Session[]
        if (!sessions || sessions.length === 0) {
          setIsLoaded(true)
          return
        }

        const nowTime = new Date()
        const currentDayIndex = nowTime.getDay()
        const curMins = nowTime.getHours() * 60 + nowTime.getMinutes()
        
        let found: Session | null = null
        
        const currentDayStr = DAY_MAP[currentDayIndex]
        const todaySessions = sessions.filter(s => s.day === currentDayStr)
        todaySessions.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        
        for (const s of todaySessions) {
          if (timeToMinutes(s.startTime) > curMins) {
            found = s
            break
          }
        }
        
        if (!found) {
          for (let offset = 1; offset <= 7; offset++) {
            const nextDayIndex = (currentDayIndex + offset) % 7
            const nextDayStr = DAY_MAP[nextDayIndex]
            
            const nextDaySessions = sessions.filter(s => s.day === nextDayStr)
            if (nextDaySessions.length > 0) {
              nextDaySessions.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
              found = nextDaySessions[0]
              break
            }
          }
        }
        
        setNextClass(found)
      } catch (err) {
        console.error("Failed to parse sessions for next class widget", err)
      } finally {
        setIsLoaded(true)
      }
    }
    
    findNextClass()
    const interval = setInterval(findNextClass, 60000)
    return () => clearInterval(interval)
  }, [userExams])

  if (!isLoaded) {
    return (
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border animate-pulse" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  const isTodayClass = nextClass?.day === DAY_MAP[new Date().getDay()]
  const dayNameFull = nextClass ? ({
    "M": "Monday", "T": "Tuesday", "W": "Wednesday", "Th": "Thursday", 
    "F": "Friday", "S": "Saturday", "Su": "Sunday"
  }[nextClass.day] || nextClass.day) : ""

  return (
    <div className="mb-8 flex flex-col gap-4">
      
      {/* EXAM WIDGET */}
      {upcomingExam && (
        <div 
          onClick={() => router.push("/dashboard/exams")}
          className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]" 
          style={{ 
            backgroundColor: "var(--bg-surface)", 
            borderColor: "var(--border-subtle)",
            borderLeft: "4px solid #ef4444" // Red for exams
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-red-500/10 text-red-500">
                Exam {upcomingExam.dayLabel}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                {upcomingExam.type} • {upcomingExam.startTime} - {upcomingExam.endTime}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {upcomingExam.courseCode} <span className="font-normal opacity-70">({upcomingExam.courseTitle})</span>
            </h2>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center opacity-70" style={{ backgroundColor: "var(--bg-surface-hover)" }}>
            <span className="text-xl">📝</span>
          </div>
        </div>
      )}

      {/* CLASS WIDGET */}
      {!nextClass ? (
        <div className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div>
            <h2 className="text-base sm:text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span>🎉</span> No upcoming classes!
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Enjoy your free time or setup your timetable if you haven't yet.
            </p>
          </div>
          <button 
            onClick={() => router.push("/dashboard/timetable")}
            className="hidden sm:block px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "var(--bg-surface-hover)", color: "var(--text-primary)", borderColor: "var(--border-subtle)", borderWidth: 1 }}
          >
            Timetable
          </button>
        </div>
      ) : (
        <div 
          onClick={() => router.push("/dashboard/classes")}
          className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]" 
          style={{ 
            backgroundColor: "var(--bg-surface)", 
            borderColor: "var(--border-subtle)",
            borderLeft: "4px solid var(--bg-accent)"
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: "var(--bg-accent)", color: "white" }}>
                Up Next
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                {isTodayClass ? "Today" : dayNameFull} • {nextClass.startTime} - {nextClass.endTime}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {nextClass.courseCode} <span className="font-normal opacity-70">({nextClass.section})</span>
            </h2>
            {nextClass.room && (
              <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <span>📍</span> Room {nextClass.room}
              </p>
            )}
          </div>
          
          <div className="h-10 w-10 rounded-full flex items-center justify-center opacity-70" style={{ backgroundColor: "var(--bg-surface-hover)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
