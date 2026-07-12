"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export function ProductTour() {
  const { status } = useSession();
  const router = useRouter();
  // Keep track of if the tour is currently active so we don't start it again on navigation
  const tourActiveRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    
    const hasSeenTour = localStorage.getItem("student_dashboard_tour_seen");
    if (hasSeenTour) return;
    if (tourActiveRef.current) return;

    tourActiveRef.current = true;

    const timer = setTimeout(() => {
      // Force navigation to dashboard start to ensure consistent state
      router.push("/dashboard");

      setTimeout(() => {
        const tour = driver({
          showProgress: true,
          allowClose: false,
          steps: [
            {
              element: 'nav',
              popover: {
                title: 'Welcome to your Dashboard!',
                description: 'This is the main navigation. You can quickly switch between all modules here.',
                side: "bottom",
                align: 'start'
              }
            },
            {
              popover: {
                title: 'Timetable',
                description: 'Let\'s head over to the Timetable to build your schedule.',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/timetable") {
                  router.push("/dashboard/timetable");
                }
              }
            },
            {
              element: 'aside',
              popover: {
                title: 'Course Selection',
                description: 'Search and select your courses here. Your selections are automatically saved.',
                side: "right",
                align: 'start'
              }
            },
            {
              popover: {
                title: 'Calendar',
                description: 'Now, let\'s look at your Academic Calendar.',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/calendar") {
                  router.push("/dashboard/calendar");
                }
              }
            },
            {
              popover: {
                title: 'Academic Events',
                description: 'Here you can view holidays, exams, and important academic dates visually!',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/attendance") {
                  router.push("/dashboard/attendance");
                }
              }
            },
            {
              popover: {
                title: 'Attendance',
                description: 'Track your class attendance here. (Coming Soon)',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/exams") {
                  router.push("/dashboard/exams");
                }
              }
            },
            {
              popover: {
                title: 'Exams',
                description: 'Manage and view your upcoming exams and scores here.',
              }
            }
          ],
          onDestroyStarted: () => {
            if (!tour.hasNextStep() || confirm("Are you sure you want to skip the rest of the tour?")) {
              localStorage.setItem("student_dashboard_tour_seen", "true");
              tourActiveRef.current = false;
              tour.destroy();
            }
          },
        });

        tour.drive();
      }, 500); // Wait for the initial /dashboard load
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, router]);

  return null;
}
