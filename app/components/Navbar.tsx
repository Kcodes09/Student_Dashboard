"use client"

import { signOut } from "next-auth/react"
import { useTheme } from "./ThemeProvider"

interface NavbarProps {
  user: {
    email?: string | null
  }
}

export default function Navbar({ user }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="flex items-center justify-between bg-[var(--bg-surface)] px-6 py-4 shadow-sm">
      <div className="font-semibold text-[var(--text-primary)]">
        Campus Dashboard
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            rounded-md
            px-2 py-1
            text-lg
            transition
            hover:bg-[var(--bg-navbar-hover)]
          "
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {/* User email */}
        <span className="px-2 text-sm text-[var(--text-muted)]">
          {user.email}
        </span>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            rounded-md
            bg-black
            px-4 py-2
            text-sm
            text-white
            transition
            hover:opacity-90
          "
        >
          Logout
        </button>
      </div>
    </nav>
  )
}



