"use client"

import { useEffect, useState } from "react"
import type { Session } from "@/types/timetable"
import { getCourseColor } from "@/components/lib/colors"
import clsx from "clsx"

const DAYS = ["M", "T", "W", "Th", "F", "S"]
const DAY_NAMES: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  S: "Saturday",
}

export default function AlarmsClient() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [alarms, setAlarms] = useState<Record<string, number>>({})
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [toast, setToast] = useState<string | null>(null)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAndroid(/android/i.test(navigator.userAgent))
      if ("Notification" in window) {
        setPermission(Notification.permission)
      }
    }

    try {
      const storedSessions = localStorage.getItem("student_dashboard_sessions")
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions))
      }

      const storedAlarms = localStorage.getItem("student_dashboard_alarms")
      if (storedAlarms) {
        setAlarms(JSON.parse(storedAlarms))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === "granted") {
        new Notification("Notifications Enabled!", {
          body: "You can now set alarms for your classes.",
          icon: "/globe.svg",
        })
      }
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSetAlarm = (session: Session, offset: number) => {
    const key = `class-${session.courseCode}-${session.day}-${session.startTime}`
    const newAlarms = { ...alarms }

    if (offset === 0) {
      delete newAlarms[key] // 0 means off
    } else {
      newAlarms[key] = offset
    }

    setAlarms(newAlarms)
    localStorage.setItem("student_dashboard_alarms", JSON.stringify(newAlarms))
    showToast(offset === 0 ? "Alarm removed" : `Alarm set for ${offset} mins before`)
  }

  const openAndroidClock = (session: Session) => {
    const key = `class-${session.courseCode}-${session.day}-${session.startTime}`
    const offset = alarms[key] || 10
    
    const [h, m] = session.startTime.split(":").map(Number)
    
    // Subtract offset
    const totalMinutes = h * 60 + m - offset
    
    // Handle day wrap around if alarm is before midnight (unlikely for classes but good practice)
    let alarmH = Math.floor(totalMinutes / 60)
    let alarmM = totalMinutes % 60
    if (alarmH < 0) alarmH += 24
    if (alarmM < 0) {
      alarmM += 60
      alarmH -= 1
      if (alarmH < 0) alarmH += 24
    }
    
    const message = encodeURIComponent(`${session.courseCode} in ${session.room}`)
    
    // Standard Android Intent for setting an alarm
    const intentUrl = `intent://#Intent;action=android.intent.action.SET_ALARM;S.android.intent.extra.alarm.MESSAGE=${message};i.android.intent.extra.alarm.HOUR=${alarmH};i.android.intent.extra.alarm.MINUTES=${alarmM};B.android.intent.extra.alarm.SKIP_UI=false;end`
    
    window.location.href = intentUrl
  }

  // Group sessions by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = sessions.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
    return acc
  }, {} as Record<string, Session[]>)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Class Alarms</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Set notifications to remind you before your classes start.
          </p>
        </div>

        {permission !== "granted" && (
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            Enable Notifications
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2 text-sm shadow-xl font-medium animate-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center p-12 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)] shadow-sm">
          <p className="text-[var(--text-muted)] font-medium">No classes found in your timetable.</p>
          <p className="text-xs text-[var(--text-muted)] mt-2 opacity-75">Go to the timetable page and make sure you've saved your classes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {DAYS.map(day => {
            const daySessions = grouped[day]
            if (daySessions.length === 0) return null

            return (
              <div key={day} className="space-y-3">
                <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                  {DAY_NAMES[day]}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {daySessions.map((s, idx) => {
                    const key = `class-${s.courseCode}-${s.day}-${s.startTime}`
                    const currentOffset = alarms[key] || 0

                    return (
                      <div
                        key={`${key}-${idx}`}
                        className={clsx(
                          "p-4 rounded-xl border flex flex-col gap-3 transition-all",
                          currentOffset > 0 
                            ? "border-[var(--bg-accent)] shadow-[0_0_15px_var(--bg-accent)] shadow-opacity-10 bg-[var(--bg-surface)]" 
                            : "border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-80 hover:opacity-100"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={clsx("text-xs font-bold px-2 py-0.5 rounded w-fit mb-1.5", getCourseColor(s.courseCode))}>
                              {s.type}
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] tracking-tight">{s.courseCode}</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.startTime} - {s.endTime} • {s.room}</p>
                          </div>
                          {currentOffset > 0 && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bg-accent)] animate-pulse shadow-[0_0_8px_var(--bg-accent)]" />
                          )}
                        </div>

                        <div className="mt-auto pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--text-muted)]">Remind me:</span>
                          <div className="flex items-center gap-2">
                            {isAndroid && (
                              <button
                                onClick={() => openAndroidClock(s)}
                                className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                title="Add to Android Clock App"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                              </button>
                            )}
                            <select
                              value={currentOffset}
                              onChange={(e) => handleSetAlarm(s, Number(e.target.value))}
                              className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-lg px-2 py-1.5 font-medium outline-none focus:ring-2 focus:ring-[var(--bg-accent)]"
                            >
                              <option value={0}>Off</option>
                              <option value={5}>5 mins before</option>
                              <option value={10}>10 mins before</option>
                              <option value={15}>15 mins before</option>
                              <option value={30}>30 mins before</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
