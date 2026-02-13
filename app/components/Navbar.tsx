"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "./ThemeProvider"

interface NavbarProps {
  user: {
    email?: string | null
  }
}

export default function Navbar({ user }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="relative flex items-center justify-between bg-[var(--bg-surface)] px-4 py-3 shadow-sm md:px-6">
      {/* LEFT: LOGO */}
      <a href="/dashboard" className="font-semibold text-sm md:text-base text-[var(--text-primary)]">
        Campus Dashboard
      </a>

      {/* RIGHT: DESKTOP */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="
            rounded-md px-2 py-1 text-lg
            transition hover:bg-[var(--bg-navbar-hover)]
          "
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

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
            <div className="px-4 py-3 text-xs text-[var(--text-muted)]">
              {user.email}
            </div>

            <button
              onClick={toggleTheme}
              className="
                flex items-center gap-2 px-4 py-3 text-sm
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




