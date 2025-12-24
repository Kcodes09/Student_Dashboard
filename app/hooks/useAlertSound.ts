"use client"

import { useRef } from "react"

export function useAlertSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio("/sounds/alert.mp3")
    audioRef.current.volume = 0.5 // slightly louder than click
  }

  const play = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  return play
}
