"use client"

import { useState, useEffect } from "react"

export default function TestAlarmsPage() {
  const [toast, setToast] = useState<string | null>(null)
  const [androidIntentUrl, setAndroidIntentUrl] = useState<string>("#")

  // Update intent url every 10 seconds to keep it ~1 min ahead
  useEffect(() => {
    const update = () => {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 1)
      const h = now.getHours()
      const m = now.getMinutes()
      const msg = encodeURIComponent("TEST101 in Test Room")
      setAndroidIntentUrl(`intent://#Intent;action=android.intent.action.SET_ALARM;S.android.intent.extra.alarm.MESSAGE=${msg};i.android.intent.extra.alarm.HOUR=${h};i.android.intent.extra.alarm.MINUTES=${m};B.android.intent.extra.alarm.SKIP_UI=false;end`)
    }
    update()
    const timer = setInterval(update, 10000)
    return () => clearInterval(timer)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const triggerDirectNotification = async () => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission()
        if (perm !== "granted") {
          showToast("Permission denied")
          return
        }
      }

      new Notification("Test Alarm: Database Systems", {
        body: "Starts in 10 minutes at 10:00 in Room 402",
        tag: "test-alarm-1",
        icon: "/globe.svg"
      })
      showToast("Direct notification sent")
    }
  }

  const triggerServiceWorkerNotification = () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        title: "Test Alarm via Service Worker",
        body: "Your class starts soon!",
        tag: "test-alarm-sw",
      })
      showToast("Service worker message sent")
    } else {
      showToast("No active service worker found")
    }
  }

  const injectFakeUpcomingClass = () => {
    // Inject a fake class that starts exactly 2 minutes from now
    // and an alarm for 1 minute before. This means the alarm should 
    // trigger exactly 1 minute from now when the NotificationManager polls.
    
    const now = new Date()
    // Class starts in 2 minutes
    now.setMinutes(now.getMinutes() + 2)
    
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const startTime = `${hours}:${mins}`
    
    // Class ends in 1 hour and 2 minutes
    now.setHours(now.getHours() + 1)
    const endHours = String(now.getHours()).padStart(2, '0')
    const endMins = String(now.getMinutes()).padStart(2, '0')
    const endTime = `${endHours}:${endMins}`

    const days = ["S", "M", "T", "W", "Th", "F", "S"]
    const currentDay = days[new Date().getDay()]

    const fakeSession = {
      courseCode: "TEST101",
      day: currentDay,
      startTime: startTime,
      endTime: endTime,
      room: "Test Room",
      type: "LECTURE"
    }

    try {
      // 1. Get existing sessions and add our fake one
      const storedSessions = localStorage.getItem("student_dashboard_sessions")
      const sessions = storedSessions ? JSON.parse(storedSessions) : []
      // Remove any existing TEST101
      const filtered = sessions.filter((s: any) => s.courseCode !== "TEST101")
      filtered.push(fakeSession)
      localStorage.setItem("student_dashboard_sessions", JSON.stringify(filtered))

      // 2. Set alarm for 1 minute before
      const storedAlarms = localStorage.getItem("student_dashboard_alarms")
      const alarms = storedAlarms ? JSON.parse(storedAlarms) : {}
      const key = `class-TEST101-${currentDay}-${startTime}`
      alarms[key] = 1 // 1 minute before

      localStorage.setItem("student_dashboard_alarms", JSON.stringify(alarms))
      
      showToast(`Fake class injected for ${startTime}. Wait ~1 minute for the alarm to pop up automatically!`)
    } catch (e) {
      console.error(e)
      showToast("Failed to inject class")
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Alarm Tester</h1>
      
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2 text-sm shadow-xl font-medium">
          {toast}
        </div>
      )}

      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm">
        <h2 className="font-bold text-lg text-[var(--text-primary)]">1. Instant Tests</h2>
        <p className="text-sm text-[var(--text-muted)]">Test if notifications display properly on your device.</p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={triggerDirectNotification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            Direct Notification
          </button>
          
          <button 
            onClick={triggerServiceWorkerNotification}
            className="px-4 py-2 bg-[var(--bg-accent)] text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Service Worker Notification
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm mt-6">
        <h2 className="font-bold text-lg text-[var(--text-primary)]">2. Live Background Test</h2>
        <p className="text-sm text-[var(--text-muted)]">
          This will inject a fake class (`TEST101`) into your locally cached timetable starting exactly 2 minutes from now, 
          with an alarm set to trigger 1 minute before the class starts. 
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          After clicking, just wait approximately 1 minute for the background `NotificationManager` to detect it and fire the alarm.
        </p>
        
        <button 
          onClick={injectFakeUpcomingClass}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
        >
          Inject Fake Class & Wait 1 Minute
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-sm mt-6">
        <h2 className="font-bold text-lg text-[var(--text-primary)]">3. Android Clock App Integration</h2>
        <p className="text-sm text-[var(--text-muted)]">Test if the Android intent correctly opens your native clock app with an alarm.</p>
        
        <a 
          href={androidIntentUrl}
          className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold hover:bg-emerald-200 active:scale-95 transition-all shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Test Android Clock (1 min from now)
        </a>
      </div>

    </div>
  )
}
