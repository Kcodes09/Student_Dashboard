"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTheme, TEAMS } from "./ThemeProvider"

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
  ]

  return (
    <nav className="relative flex items-center justify-between bg-[var(--bg-main)] border-b border-[var(--border-subtle)] px-4 py-3 shadow-sm md:px-6">
      {/* LEFT: LOGO & LINKS */}
      <div className="flex items-center gap-6">
        <a href="/dashboard" className="font-semibold text-sm md:text-base text-[var(--text-primary)] whitespace-nowrap">
          Campus Dashboard
        </a>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.name}
              </a>
            )
          })}
        </div>
      </div>

      {/* DYNAMIC ACTIONS PORTAL (Used by Timetable) */}
      <div id="navbar-actions-portal" className="flex-1 flex justify-end items-center mr-4" />

      {/* RIGHT: DESKTOP */}
      <div className="hidden md:flex items-center gap-3">
        {/* World Cup Mode Toggle */}
        <button
          onClick={toggleWorldCupMode}
          className={`rounded-md px-2 py-1 text-lg transition border ${worldCupMode ? "bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700" : "hover:bg-[var(--bg-navbar-hover)] border-transparent"}`}
          title="World Cup Mode"
        >
          🏆
        </button>
        
        {/* Team Selector Dropdown */}
        {worldCupMode && (
          <select
            value={activeTeam}
            onChange={(e) => setActiveTeam(e.target.value)}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bg-accent)] w-36 shadow-sm"
          >
            {TEAMS.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        )}

        <button
          onClick={toggleTheme}
          className="
            rounded-md px-2 py-1 text-lg
            transition hover:bg-[var(--bg-navbar-hover)]
          "
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {user.image && (
          <img 
            src={user.image} 
            alt="Profile" 
            className="h-8 w-8 rounded-full border border-[var(--border-subtle)] object-cover" 
          />
        )}
        <span className="text-sm text-[var(--text-muted)]">
          {user.email}
        </span>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            rounded-md bg-black px-4 py-2 text-sm text-white
            transition hover:opacity-90
          "
        >
          Logout
        </button>
      </div>

      {/* RIGHT: MOBILE */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="rounded-md px-2 py-1 text-xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div
          className="
            absolute right-3 top-full z-50 mt-2
            w-56 rounded-lg border
            bg-[var(--bg-surface)]
            shadow-lg
          "
        >
          <div className="flex flex-col divide-y">
            <div className="px-4 py-3 flex items-center gap-3">
              {user.image && (
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border border-[var(--border-subtle)] object-cover" 
                />
              )}
              <div className="flex flex-col">
                {user.name && <span className="text-sm font-medium text-[var(--text-primary)]">{user.name}</span>}
                <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
              </div>
            </div>

            {/* MOBILE NAV LINKS */}
            <div className="flex flex-col py-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-navbar-hover)]"
                    }`}
                  >
                    {link.name}
                  </a>
                )
              })}
            </div>

            {/* MOBILE WORLD CUP MODE */}
            <div className="px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">🏆 World Cup Mode</span>
                <button 
                  onClick={toggleWorldCupMode}
                  className={`w-10 h-5 rounded-full relative transition-colors ${worldCupMode ? "bg-amber-500" : "bg-[var(--bg-muted)]"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${worldCupMode ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              {worldCupMode && (
                <select
                  value={activeTeam}
                  onChange={(e) => setActiveTeam(e.target.value)}
                  className="mt-3 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-2 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bg-accent)]"
                >
                  {TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="
                flex items-center gap-2 px-4 py-3 text-sm border-t border-[var(--border-subtle)]
                hover:bg-[var(--bg-navbar-hover)]
              "
            >
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="
                px-4 py-3 text-sm text-red-600
                hover:bg-red-50
              "
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}




