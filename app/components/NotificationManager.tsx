"use client";

import { useEffect, useState, useRef } from "react";
import type { Session, Exam } from "@/types/timetable";
import { useSession } from "next-auth/react";
import { useAlertSound } from "@/app/hooks/useAlertSound";

export function NotificationManager() {
  const { status } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [sessions, setSessions] = useState<Session[]>([]);
  
  const [activeAlarm, setActiveAlarm] = useState<{courseCode: string, startTime: string, room: string, offset: number} | null>(null);
  const playAlert = useAlertSound();
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerInAppAlarm = (data: {courseCode: string, startTime: string, room: string, offset: number}) => {
    setActiveAlarm(data);
    
    // Play the alert sound repeatedly (every 3 seconds)
    playAlert();
    alarmIntervalRef.current = setInterval(() => {
      playAlert();
    }, 3000);
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    
    // Load sessions from localStorage
    try {
      const stored = localStorage.getItem("student_dashboard_sessions");
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [status]);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        new Notification("Notifications Enabled!", {
          body: "You will now be notified before your classes start.",
          icon: "/globe.svg"
        });
      }
    }
  };

  useEffect(() => {
    if (permission !== "granted") return;

    // A simple polling mechanism to check for upcoming classes
    // In a real PWA, you might use Web Push or background sync, 
    // but local interval works while the app is active.
    const checkUpcoming = () => {
      let currentSessions = sessions;
      let alarms: Record<string, number> = {};
      
      try {
        const storedSessions = localStorage.getItem("student_dashboard_sessions");
        if (storedSessions) currentSessions = JSON.parse(storedSessions);
        
        const storedAlarms = localStorage.getItem("student_dashboard_alarms");
        if (storedAlarms) alarms = JSON.parse(storedAlarms);
      } catch (e) {
        console.error("Error reading from localStorage in NotificationManager", e);
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const days = ["S", "M", "T", "W", "Th", "F", "S"];
      const dayStr = days[currentDay];

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      currentSessions.forEach(session => {
        if (session.day !== dayStr) return;

        const key = `class-${session.courseCode}-${session.day}-${session.startTime}`;
        const offset = alarms[key];

        if (!offset || offset <= 0) return; // No alarm set

        // parse startTime (e.g., "08:00" or "08:30")
        const [h, m] = session.startTime.split(":").map(Number);
        const sessionMinutes = h * 60 + m;

        // Notify precisely at the configured offset
        if (sessionMinutes - currentMinutes === offset) {
          const title = `Upcoming Class: ${session.courseCode}`;
          const body = `Starts in ${offset} minutes at ${session.startTime} in ${session.room}`;

          // TRIGGER IN-APP ALARM MODAL
          triggerInAppAlarm({
            courseCode: session.courseCode,
            startTime: session.startTime,
            room: session.room || "",
            offset,
          });

          // Send to Service Worker or show directly for when app is in background
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "SCHEDULE_NOTIFICATION",
              title,
              body,
              tag: key,
            });
          } else {
            new Notification(title, {
              body,
              tag: key,
            });
          }
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkUpcoming, 60000);
    // Also check immediately
    checkUpcoming();

    return () => clearInterval(intervalId);
  }, [permission, sessions]);

  if (permission !== "granted" && status === "authenticated") {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 flex items-center justify-between">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Enable notifications to get custom alerts before your classes start.
        </p>
        <button
          onClick={requestPermission}
          className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          Enable
        </button>
      </div>
    );
  }

  // Render the full-screen ringing alarm if active
  if (activeAlarm) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-shake">
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
              <path d="M22 10a10 10 0 1 0-20 0c0 4.53-2 8-2 8h24s-2-3.47-2-8z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-black text-red-600 dark:text-red-500 mb-2 tracking-tight uppercase">Alarm</h2>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-4">{activeAlarm.courseCode}</p>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Starts in {activeAlarm.offset} minutes at {activeAlarm.startTime}
          </p>
          {activeAlarm.room && (
            <p className="text-lg font-bold text-[var(--bg-accent)] mt-4">{activeAlarm.room}</p>
          )}
          
          <button 
            onClick={dismissAlarm}
            className="mt-8 bg-red-600 hover:bg-red-700 text-white w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
}
