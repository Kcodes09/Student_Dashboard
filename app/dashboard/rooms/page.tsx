import { Metadata } from "next"
import RoomAvailabilityClient from "./RoomAvailabilityClient"

export const metadata: Metadata = {
  title: "Free Classrooms | Student Dashboard",
  description: "Find empty classrooms for studying or club activities.",
}

export default function RoomAvailabilityPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Free Classrooms
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Select a day and time to find available empty classrooms.
          </p>
        </div>
        
        <RoomAvailabilityClient />
      </main>
    </div>
  )
}
