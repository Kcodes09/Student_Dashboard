"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { MapPin, Search } from "lucide-react"
import masterTT from "@/data/mastertt.json"

const DAYS = ["M", "T", "W", "Th", "F", "S"]
const HOURS = Array.from({ length: 11 }, (_, i) => i + 1)

export default function RoomAvailabilityClient() {
  const [selectedDay, setSelectedDay] = useState<string>("M")
  const [selectedHour, setSelectedHour] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Pre-process masterTT to find all rooms and occupied slots
  const { allRooms, occupiedRooms } = useMemo(() => {
    const rooms = new Set<string>()
    // occupiedRooms[day][hour] = Set<string> of occupied rooms
    const occupied: Record<string, Record<number, Set<string>>> = {}
    
    DAYS.forEach(d => {
      occupied[d] = {}
      HOURS.forEach(h => {
        occupied[d][h] = new Set()
      })
    })

    masterTT.forEach((course: any) => {
      course.sections?.forEach((section: any) => {
        section.sessions?.forEach((session: any) => {
          const room = session.room?.trim()
          if (!room) return
          
          rooms.add(room)
          
          if (occupied[session.day] && occupied[session.day][session.hour]) {
            occupied[session.day][session.hour].add(room)
          }
        })
      })
    })

    return { 
      allRooms: Array.from(rooms).sort(), 
      occupiedRooms: occupied 
    }
  }, [])

  const freeRooms = useMemo(() => {
    const occupiedRightNow = occupiedRooms[selectedDay]?.[selectedHour] || new Set()
    return allRooms.filter(room => !occupiedRightNow.has(room))
  }, [allRooms, occupiedRooms, selectedDay, selectedHour])

  // Group rooms by prefix (e.g. "F101" -> "F Block", "LT1" -> "LT")
  const groupedRooms = useMemo(() => {
    const groups: Record<string, string[]> = {}
    
    const filtered = freeRooms.filter(room => 
      room.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.forEach(room => {
      let prefix = "Other"
      if (room.startsWith("F")) prefix = "F Block"
      else if (room.startsWith("G")) prefix = "G Block"
      else if (room.startsWith("LT")) prefix = "Lecture Theatres"
      else if (room.startsWith("FD")) prefix = "FD Block"
      else if (room.startsWith("C")) prefix = "C Block"

      if (!groups[prefix]) groups[prefix] = []
      groups[prefix].push(room)
    })

    return groups
  }, [freeRooms, searchQuery])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div 
        className="p-6 rounded-2xl shadow-sm border space-y-4"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
              Day of Week
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all appearance-none bg-transparent"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <option value="M">Monday</option>
              <option value="T">Tuesday</option>
              <option value="W">Wednesday</option>
              <option value="Th">Thursday</option>
              <option value="F">Friday</option>
              <option value="S">Saturday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
              Hour
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all appearance-none bg-transparent"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              {HOURS.map(h => (
                <option key={h} value={h}>
                  Hour {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative pt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a specific room (e.g. F102)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-transparent"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              caretColor: "var(--color-primary)",
            }}
          />
        </div>
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Available Rooms
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {freeRooms.length} rooms free on {selectedDay} during Hour {selectedHour}
          </p>
        </div>

        {Object.keys(groupedRooms).length === 0 ? (
          <div 
            className="p-8 text-center rounded-2xl border border-dashed"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            No free rooms found matching your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedRooms).map(([group, rooms]) => (
              <div 
                key={group} 
                className="p-5 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{group}</h3>
                  <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {rooms.length}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {rooms.map(room => (
                    <div 
                      key={room}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border flex items-center justify-center transition-transform hover:scale-105 cursor-default"
                      style={{
                        backgroundColor: "var(--bg-main)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {room}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
