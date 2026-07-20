"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTheme, TEAMS } from "@/app/components/ThemeProvider"
import ClashAlert from "./ClashAlert"

interface NavbarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function Navbar({ user }: NavbarProps) {
  const { theme, toggleTheme, worldCupMode, toggleWorldCupMode, activeTeam, setActiveTeam } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Attendance", href: "/dashboard/attendance" },
    { name: "Classes", href: "/dashboard/classes" },
    { name: "Exams", href: "/dashboard/exams" },
    { name: "Timetable", href: "/dashboard/timetable" },
    { name: "Calendar", href: "/dashboard/calendar" },
    { name: "Alarms", href: "/dashboard/alarms" },
  ]

  if (user.email === "f20241022@hyderabad.bits-pilani.ac.in") {
    navLinks.push({ name: "Admin", href: "/dashboard/admin" })
  }

  return (
    <>
      <nav
        className="relative flex items-center justify-between border-b px-2 md:px-4 py-3"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* LEFT: LOGO & LINKS */}
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 overflow-hidden">
          <a
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-sm md:text-base whitespace-nowrap shrink-0"
            style={{ color: "var(--text-primary)" }}
          >
            {/* Logo icon */}
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, var(--bg-accent), #818cf8)" }}
            >
              🎓
            </span>
            <span className="hidden sm:inline">Campus Dashboard</span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-0 lg:gap-1 shrink min-w-0 overflow-x-auto no-scrollbar">
            {navLinks.map(link => {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-2 lg:px-3 py-2 text-sm font-medium rounded-lg transition-all shrink-0 whitespace-nowrap"
                  style={{
                    color: "var(--text-muted)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-navbar-hover)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                  }}
                >
                  {link.name}
                </a>
              )
            })}
          </div>
        </div>


        {/* RIGHT: DESKTOP */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
          <ClashAlert />
          {/* Tour / Info Button */}
          <button
            onClick={() => {
              import('@/lib/tour').then(({ startTour }) => startTour(pathname || '/', theme))
            }}
            className="rounded-lg p-2 text-xl transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-navbar-hover)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            title="Page Tour"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>

          {/* World Cup Mode Toggle */}
          <button
            onClick={toggleWorldCupMode}
            className="rounded-lg px-2.5 py-1.5 text-base transition-all border"
            style={{
              backgroundColor: worldCupMode ? "rgba(251,191,36,0.15)" : "transparent",
              borderColor: worldCupMode ? "rgb(251,191,36)" : "transparent",
            }}
            title="World Cup Mode"
          >
            🏆
          </button>

          {/* Team Selector Dropdown */}
          {worldCupMode && (
            <select
              value={activeTeam}
              onChange={(e) => setActiveTeam(e.target.value)}
              className="rounded-lg border px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 w-36"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
              }}
            >
              {TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          )}

          {/* Theme Toggle */}
          <button
            id="tour-theme-toggle"
            onClick={toggleTheme}
            className="rounded-lg px-2.5 py-1.5 text-base transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-navbar-hover)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* User Profile Trigger */}
          <button
            id="tour-profile"
            onClick={() => window.dispatchEvent(new Event("open-profile"))}
            className="flex items-center gap-2 hover:bg-[var(--bg-surface-hover)] p-1 rounded-full md:rounded-lg pr-2 transition-colors border border-transparent hover:border-[var(--border-subtle)]"
            title="Edit Profile & Branch"
          >
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="text-xs max-w-[120px] truncate hidden lg:block"
              style={{ color: "var(--text-muted)" }}
            >
              {user.email}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"
              ;(e.currentTarget as HTMLElement).style.color = "rgb(239,68,68)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
              ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"
              ;(e.currentTarget as HTMLElement).style.color = "var(--text-primary)"
            }}
          >
            Logout
          </button>
        </div>

        {/* RIGHT: MOBILE HAMBURGER */}
        <div className="md:hidden flex items-center gap-2">
          <ClashAlert />
          {/* Tour / Info Button (Mobile) */}
          <button
            onClick={() => {
              import('@/lib/tour').then(({ startTour }) => startTour(pathname || '/', theme))
            }}
            className="rounded-lg p-2 transition-all"
            style={{ color: "var(--text-muted)" }}
            aria-label="Page Tour"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="rounded-lg p-2 transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-navbar-hover)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {menuOpen && (
          <div
            className="absolute right-3 top-full z-50 mt-2 w-64 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="flex flex-col">
              {/* User Info */}
              <div
                className="px-4 py-3 flex items-center gap-3 border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                {user.image && (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700"
                  />
                )}
                <div className="flex flex-col min-w-0">
                  {user.name && (
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {user.name}
                    </span>
                  )}
                  <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {user.email}
                  </span>
                </div>
              </div>

              {/* MOBILE NAV LINKS */}
              <div className="flex flex-col py-1">
                {navLinks.map(link => {
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all"
                      style={{
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-navbar-hover)"
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      {link.name}
                    </a>
                  )
                })}
              </div>

              {/* MOBILE WORLD CUP MODE */}
              <div
                className="px-4 py-3 border-t"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>🏆 World Cup Mode</span>
                  <button
                    onClick={toggleWorldCupMode}
                    className="w-10 h-5 rounded-full relative transition-colors"
                    style={{ backgroundColor: worldCupMode ? "rgb(245,158,11)" : "var(--bg-muted)" }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm"
                      style={{ transform: worldCupMode ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
                {worldCupMode && (
                  <select
                    value={activeTeam}
                    onChange={(e) => setActiveTeam(e.target.value)}
                    className="mt-3 w-full rounded-lg border px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {TEAMS.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-t transition-all"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-navbar-hover)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span>{theme === "dark" ? "🌙" : "☀️"}</span>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </button>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-3 text-sm font-medium text-left border-t transition-all"
                style={{ borderColor: "var(--border-subtle)", color: "rgb(239,68,68)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile backdrop to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
