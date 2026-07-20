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
                title: 'Welcome back!',
                description: 'We\'ve added some massive new features to your dashboard. Let\'s take a quick tour.',
                side: "bottom",
                align: 'start'
              }
            },
            {
              popover: {
                title: 'Smart Widgets 🚀',
                description: 'Right here on the main dashboard, you\'ll now see an "Up Next" widget that automatically shows your next upcoming class and alerts you of exams for today or tomorrow!',
              }
            },
            {
              popover: {
                title: 'Multi-Timetable Manager',
                description: 'Let\'s head over to the Timetable page to see the new Draft system.',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/timetable") {
                  router.push("/dashboard/timetable");
                }
              }
            },
            {
              popover: {
                title: 'Drafts & Active Timetables',
                description: 'You can now create multiple timetables! Experiment with different class combinations, and set your favorite one as Active.',
              }
            },
            {
              popover: {
                title: 'Real-time Clash Detection 🚨',
                description: 'While building your timetable, if you select overlapping classes, a global Clash Alert will instantly appear in your navbar to warn you.',
              }
            },
            {
              popover: {
                title: 'Smart Profile',
                description: 'Finally, let\'s check your Profile.',
              },
              onHighlightStarted: () => {
                if (window.location.pathname !== "/dashboard/profile") {
                  router.push("/dashboard/profile");
                }
              }
            },
            {
              popover: {
                title: 'Auto-ID Extraction',
                description: 'We now automatically extract your batch, campus, and ID directly from your student email to configure your degree properly. You can always override it here.',
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

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .driver-popover-next-btn {
        background-color: var(--bg-accent) !important;
        color: white !important;
        font-weight: 800 !important;
        border-radius: 6px !important;
        padding: 6px 14px !important;
        text-shadow: 0 0 4px rgba(255,255,255,0.4) !important;
        box-shadow: 0 0 15px var(--bg-accent) !important;
        animation: pulse-glow 1.5s infinite;
        border: none !important;
      }
      .driver-popover-next-btn:hover {
        transform: scale(1.05);
      }
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    ` }} />
  );
}
