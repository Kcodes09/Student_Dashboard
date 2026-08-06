"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Clock, CalendarDays, MapPin } from "lucide-react"
import masterTT from "@/data/mastertt.json"

interface SessionInfo {
  courseCode: string
  courseTitle: string
  section: string
  type: string
  day: string
  hour: number
  startTime: string
  endTime: string
  room: string
}

const DAYS = ["M", "T", "W", "Th", "F", "S"]
const HOURS = Array.from({ length: 11 }, (_, i) => i + 1)

export default function FacultyAvailabilityClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)

  // Process masterTT to map each instructor to their sessions
  const facultyData = useMemo(() => {
    const map = new Map<string, SessionInfo[]>()

    masterTT.forEach((course: any) => {
      course.sections?.forEach((section: any) => {
        section.instructors?.forEach((instructor: string) => {
          const name = instructor.trim().toUpperCase()
          if (!name) return

          if (!map.has(name)) {
            map.set(name, [])
          }

          section.sessions?.forEach((session: any) => {
            map.get(name)?.push({
              courseCode: course.courseCode,
              courseTitle: course.courseTitle,
              section: section.section,
              type: section.type,
              day: session.day,
              hour: session.hour,
              startTime: session.startTime,
              endTime: session.endTime,
              room: session.room,
            })
          })
        })
      })
    })

    return map
  }, [])

  const facultyNames = Array.from(facultyData.keys()).sort()

  const filteredFaculty = useMemo(() => {
    if (!searchQuery) return []
    const query = searchQuery.toUpperCase()
    return facultyNames.filter(name => name.includes(query)).slice(0, 10)
  }, [searchQuery, facultyNames])

  const selectedSchedule = useMemo(() => {
    if (!selectedFaculty) return null
    return facultyData.get(selectedFaculty) || []
  }, [selectedFaculty, facultyData])

  const getSession = (day: string, hour: number) => {
    return selectedSchedule?.find(s => s.day === day && s.hour === hour)
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div 
        className="p-6 rounded-2xl shadow-sm border relative z-20"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a professor (e.g. SAYAN DAS)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (selectedFaculty && e.target.value.toUpperCase() !== selectedFaculty) {
                setSelectedFaculty(null)
              }
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-transparent"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              caretColor: "var(--color-primary)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          />
          
          {/* Autocomplete Dropdown */}
          {searchQuery && !selectedFaculty && filteredFaculty.length > 0 && (
            <div 
              className="absolute w-full mt-2 rounded-xl shadow-lg border overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {filteredFaculty.map(name => (
                <button
                  key={name}
                  className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => {
                    setSelectedFaculty(name)
                    setSearchQuery(name)
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      {selectedFaculty && selectedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div>
              <h2 
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedFaculty}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Weekly Schedule
              </p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Busy
              </span>
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Free
              </span>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="font-semibold text-center text-sm py-2">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="font-semibold text-center text-sm py-2" style={{ color: "var(--text-primary)" }}>
                    {day}
                  </div>
                ))}
              </div>

              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-7 gap-2 mb-2">
                  <div 
                    className="flex items-center justify-center text-xs font-medium rounded-lg border"
                    style={{ 
                      backgroundColor: "var(--bg-main)", 
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)"
                    }}
                  >
                    Hour {hour}
                  </div>
                  
                  {DAYS.map(day => {
                    const session = getSession(day, hour)
                    
                    if (session) {
                      return (
                        <div 
                          key={`${day}-${hour}`}
                          className="p-2 rounded-lg border text-xs flex flex-col gap-1 transition-all hover:scale-105"
                          style={{
                            backgroundColor: "rgba(239, 68, 68, 0.05)",
                            borderColor: "rgba(239, 68, 68, 0.2)",
                            color: "var(--text-primary)"
                          }}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{session.courseCode}</span>
                            <span className="text-[10px] opacity-70">{session.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <MapPin className="w-3 h-3" />
                            {session.room}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Clock className="w-3 h-3" />
                            {session.startTime} - {session.endTime}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div 
                        key={`${day}-${hour}`}
                        className="rounded-lg border border-dashed flex items-center justify-center"
                        style={{
                          borderColor: "rgba(34, 197, 94, 0.3)",
                          backgroundColor: "rgba(34, 197, 94, 0.02)"
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
