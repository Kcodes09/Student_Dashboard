"use client"

import Link from "next/link"


interface DashboardCardProps {
  title: string
  description: string
  href: string
  comingSoon?: boolean
}

const CARD_META: Record<string, { icon: string; gradient: string }> = {
  Attendance:    { icon: "📊", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  Classes:       { icon: "🏫", gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  "Exam Planner":{ icon: "📝", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  Timetable:     { icon: "🗓️", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  Alarms:        { icon: "🔔", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  Calendar:      { icon: "📅", gradient: "linear-gradient(135deg, #f97316, #fb923c)" },
}

export default function DashboardCard({
  title,
  description,
  href,
  comingSoon,
}: DashboardCardProps) {
  const meta = CARD_META[title] ?? { icon: "📌", gradient: "linear-gradient(135deg, #6366f1, #818cf8)" }

  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-4 rounded-2xl p-5 overflow-hidden transition-all duration-200 ${
        comingSoon
          ? "opacity-60 pointer-events-none cursor-not-allowed"
          : "cursor-pointer hover:-translate-y-1"
      }`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={e => {
        if (!comingSoon) {
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "transparent"
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"
        ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"
      }}
    >
      {/* Gradient accent top strip */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ background: meta.gradient }}
      />

      {/* Coming soon badge */}
      {comingSoon && (
        <span
          className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide"
          style={{ background: meta.gradient }}
        >
          SOON
        </span>
      )}

      {/* Icon */}
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-sm"
        style={{ background: meta.gradient }}
      >
        {meta.icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h2
          className="text-base font-semibold mb-1 leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      {!comingSoon && (
        <div
          className="flex items-center gap-1 text-xs font-semibold mt-auto transition-all group-hover:gap-2"
          style={{ color: "var(--text-accent)" }}
        >
          Open
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </Link>
  )
}
