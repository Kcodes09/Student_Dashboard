"use client";

import { useEffect, useState } from "react";
import type { Session, Exam } from "@/types/timetable";

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
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
  }, []);

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
      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const days = ["S", "M", "T", "W", "Th", "F", "S"];
      const dayStr = days[currentDay];

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      sessions.forEach(session => {
        if (session.day !== dayStr) return;

        // parse startTime (e.g., "08:00" or "08:30")
        const [h, m] = session.startTime.split(":").map(Number);
        const sessionMinutes = h * 60 + m;

        // Notify 10 minutes before
        if (sessionMinutes - currentMinutes === 10) {
          // Send to Service Worker or show directly
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "SCHEDULE_NOTIFICATION",
              title: `Upcoming Class: ${session.courseCode}`,
              body: `Starts in 10 minutes at ${session.startTime}`,
              tag: `class-${session.courseCode}-${session.startTime}`,
            });
          } else {
            new Notification(`Upcoming Class: ${session.courseCode}`, {
              body: `Starts in 10 minutes at ${session.startTime}`,
              tag: `class-${session.courseCode}-${session.startTime}`,
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

  if (permission === "granted") return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 flex items-center justify-between">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        Enable notifications to get alerts 10 minutes before your classes start.
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
