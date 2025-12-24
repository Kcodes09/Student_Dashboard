"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const initial = stored ?? "light"

    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      document.documentElement.classList.toggle("dark", next === "dark")
      localStorage.setItem("theme", next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}




