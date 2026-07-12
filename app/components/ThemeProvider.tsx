"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark"

export const TEAMS = [
  "Argentina", "Brazil", "France", "Germany", "Spain", "Portugal", "England", "USA",
  "Mexico", "Canada", "Italy", "Netherlands", "Uruguay", "Croatia", "Belgium", "Japan",
  "Senegal", "Morocco", "South Korea", "Switzerland", "Denmark", "Colombia",
  "Ghana", "Algeria", "Ivory Coast", "Egypt", "Ecuador",
  "Sweden", "Australia", "Iran", "Saudi Arabia",
  "Panama", "Tunisia", "Qatar", "New Zealand", "Paraguay"
]

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  worldCupMode: boolean
  toggleWorldCupMode: () => void
  activeTeam: string
  setActiveTeam: (team: string) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [worldCupMode, setWorldCupMode] = useState<boolean>(false)
  const [activeTeam, setActiveTeamState] = useState<string>("Argentina")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null
    const initialTheme = storedTheme ?? "light"
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")

    const storedMode = localStorage.getItem("worldCupMode") === "true"
    const storedTeam = localStorage.getItem("activeTeam") ?? "Argentina"

    setWorldCupMode(storedMode)
    setActiveTeamState(storedTeam)

    if (storedMode) {
      document.documentElement.dataset.team = storedTeam.toLowerCase().replace(/\s+/g, '-')
    } else {
      delete document.documentElement.dataset.team
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      document.documentElement.classList.toggle("dark", next === "dark")
      localStorage.setItem("theme", next)
      return next
    })
  }

  const toggleWorldCupMode = () => {
    setWorldCupMode((prev) => {
      const next = !prev
      localStorage.setItem("worldCupMode", String(next))
      if (next) {
        document.documentElement.dataset.team = activeTeam.toLowerCase().replace(/\s+/g, '-')
      } else {
        delete document.documentElement.dataset.team
      }
      return next
    })
  }

  const setActiveTeam = (team: string) => {
    setActiveTeamState(team)
    localStorage.setItem("activeTeam", team)
    if (worldCupMode) {
      document.documentElement.dataset.team = team.toLowerCase().replace(/\s+/g, '-')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, worldCupMode, toggleWorldCupMode, activeTeam, setActiveTeam }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}




