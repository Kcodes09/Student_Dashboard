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

  const getAndroidClockIntentUrl = (session: Session) => {
    const key = `class-${session.courseCode}-${session.day}-${session.startTime}`
    const offset = alarms[key] || 10

    const [h, m] = session.startTime.split(":").map(Number)

    // Subtract offset
    const totalMinutes = h * 60 + m - offset

    // Handle day wrap around
    let alarmH = Math.floor(totalMinutes / 60)
    let alarmM = totalMinutes % 60
    if (alarmH < 0) alarmH += 24
    if (alarmM < 0) {
      alarmM += 60
      alarmH -= 1
      if (alarmH < 0) alarmH += 24
    }

    const message = `${session.courseCode}_in_${session.room}`.replace(/\s+/g, "_")

    return `intent:#Intent;action=android.intent.action.SET_ALARM;category=android.intent.category.BROWSABLE;S.android.intent.extra.alarm.MESSAGE=${message};i.android.intent.extra.alarm.HOUR=${alarmH};i.android.intent.extra.alarm.MINUTES=${alarmM};B.android.intent.extra.alarm.SKIP_UI=false;component=com.google.android.deskclock/com.android.deskclock.HandleSetApiCalls;end`
  }

  // Group sessions by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = sessions.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
    return acc
  }, {} as Record<string, Session[]>)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Class Alarms
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Get notified before your classes start.
          </p>
        </div>

        {permission !== "granted" && (
          <button
            onClick={requestPermission}
            id="enable-notifications-btn"
            className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
            }}
          >
            {/* Bell icon with animation */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            Enable Notifications
          </button>
        )}

        {permission === "granted" && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.3)",
              color: "rgb(5,150,105)",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Notifications enabled
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl border px-5 py-3 text-sm shadow-xl font-medium flex items-center gap-2"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
          {toast}
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border flex flex-col items-center gap-3"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            🔔
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              No classes in your timetable
            </p>
            <p className="text-sm mt-1 opacity-75" style={{ color: "var(--text-muted)" }}>
              Go to the timetable page and save your classes first.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {DAYS.map(day => {
            const daySessions = grouped[day]
            if (daySessions.length === 0) return null

            return (
              <div key={day} className="space-y-3">
                <h2
                  className="text-base font-bold pb-2 border-b flex items-center gap-2"
                  style={{
                    color: "var(--text-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <span
                    className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: "linear-gradient(135deg, var(--bg-accent), #818cf8)" }}
                  >
                    {day}
                  </span>
                  {DAY_NAMES[day]}
                  <span
                    className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--bg-selected)",
                      color: "var(--text-accent)",
                    }}
                  >
                    {daySessions.length} class{daySessions.length !== 1 ? "es" : ""}
                  </span>
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {daySessions.map((s, idx) => {
                    const key = `class-${s.courseCode}-${s.day}-${s.startTime}`
                    const currentOffset = alarms[key] || 0
                    const isActive = currentOffset > 0

                    return (
                      <div
                        key={`${key}-${idx}`}
                        className={clsx(
                          "p-4 rounded-2xl border flex flex-col gap-3 transition-all",
                          isActive ? "shadow-md" : "opacity-85 hover:opacity-100"
                        )}
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          borderColor: isActive ? "var(--bg-accent)" : "var(--border-subtle)",
                          boxShadow: isActive
                            ? "0 0 0 1px var(--bg-accent), var(--shadow-sm)"
                            : "var(--shadow-sm)",
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className={clsx("text-[11px] font-bold px-2 py-0.5 rounded-md w-fit mb-1.5", getCourseColor(s.courseCode))}>
                              {s.type}
                            </div>
                            <h3
                              className="font-bold text-sm tracking-tight truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {s.courseCode}
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {s.startTime} – {s.endTime} · {s.room}
                            </p>
                          </div>
                          {isActive && (
                            <div
                              className="h-2.5 w-2.5 rounded-full animate-pulse mt-1 ml-2 shrink-0"
                              style={{
                                backgroundColor: "var(--bg-accent)",
                                boxShadow: "0 0 8px var(--bg-accent)",
                              }}
                            />
                          )}
                        </div>

                        {/* Alarm controls */}
                        <div
                          className="mt-auto pt-2 border-t flex items-center justify-between gap-2"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                            Remind me:
                          </span>
                          <div className="flex items-center gap-2">
                            {isAndroid && (
                              <a
                                href={getAndroidClockIntentUrl(s)}
                                className="p-1.5 rounded-lg transition-all"
                                style={{
                                  backgroundColor: "rgba(16,185,129,0.1)",
                                  color: "rgb(5,150,105)",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.2)")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.1)")}
                                title="Add to Android Clock App"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                              </a>
                            )}
                            <select
                              value={currentOffset}
                              onChange={(e) => handleSetAlarm(s, Number(e.target.value))}
                              className="border text-xs rounded-lg px-2 py-1.5 font-medium outline-none focus:ring-2 transition-all"
                              style={{
                                backgroundColor: "var(--bg-surface-hover)",
                                borderColor: "var(--border-subtle)",
                                color: "var(--text-primary)",
                              }}
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
