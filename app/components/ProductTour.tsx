"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function ProductTour() {
  const { status } = useSession();

  useEffect(() => {
    // Only run tour for logged-in users
    if (status !== "authenticated") return;
    
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem("student_dashboard_tour_seen");
    if (hasSeenTour) return;

    // Small delay to ensure UI is fully rendered
    const timer = setTimeout(() => {
      const tour = driver({
        showProgress: true,
        steps: [
          {
            element: 'nav',
            popover: {
              title: 'Welcome to your Dashboard!',
              description: 'This is the main navigation. You can quickly switch between your Timetable, Calendar, and Attendance views from here.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: 'aside',
            popover: {
              title: 'Course Selection',
              description: 'Search and select your courses here. Your selections are automatically saved so you do not have to pick them again.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#navbar-actions-portal', // Target the portal or the main grid
            popover: {
              title: 'Export & Share',
              description: 'Once you build your perfect timetable, you can easily export it as an image or an ICS calendar file directly from here.',
              side: "bottom",
              align: 'end'
            }
          }
        ],
        onDestroyStarted: () => {
          if (!tour.hasNextStep() || confirm("Are you sure you want to skip the rest of the tour?")) {
            localStorage.setItem("student_dashboard_tour_seen", "true");
            tour.destroy();
          }
        },
      });

      tour.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, [status]);

  return null;
}
