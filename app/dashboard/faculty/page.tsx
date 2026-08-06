import { Metadata } from "next"
import FacultyAvailabilityClient from "./FacultyAvailabilityClient"

export const metadata: Metadata = {
  title: "Faculty Free Time | Student Dashboard",
  description: "Find available professors and view their weekly schedule.",
}

export default function FacultyAvailabilityPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Faculty Free Time
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Search for your professors to see their weekly schedule and availability.
          </p>
        </div>
        
        <FacultyAvailabilityClient />
      </main>
    </div>
  )
}
