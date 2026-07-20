import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "../components/Navbar"
import DashboardCard from "../components/DashboardCard"
import NextClassWidget from "../components/NextClassWidget"
import { getCachedExams } from "@/lib/cachedData"

export const revalidate = 60

function getGreeting(name?: string | null) {
  const hour = new Date().getHours()
  const firstName = name?.split(" ")[0] ?? "there"
  if (hour < 12) return `Good morning, ${firstName} ☀️`
  if (hour < 17) return `Good afternoon, ${firstName} 👋`
  return `Good evening, ${firstName} 🌙`
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const greeting = getGreeting(session.user?.name)
  
  let userExams: any[] = []
  if (session.user?.email) {
    const raw = await getCachedExams(session.user.email)
    // Serialize dates for client component
    userExams = raw.map(e => ({
      ...e,
      date: e.date.toISOString(),
    }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      <Navbar user={session.user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting header */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {greeting}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Here&apos;s your student dashboard — all your academic tools in one place.
          </p>
        </div>

        <div id="tour-next-class">
          <NextClassWidget userExams={userExams} />
        </div>

        {/* Cards grid */}
        <div id="tour-nav-cards" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <DashboardCard
            title="Timetable"
            description="Set up your courses, sections & view your weekly schedule"
            href="/dashboard/timetable"
          />

          <DashboardCard
            title="Calendar"
            description="View classes, exams, and holidays in a monthly calendar"
            href="/dashboard/calendar"
          />

          <DashboardCard
            title="Attendance"
            description="Track your attendance percentage per course"
            href="/dashboard/attendance"
          />

          <DashboardCard
            title="Classes"
            description="See when classes begin and today&apos;s schedule"
            href="/dashboard/classes"
          />

          <DashboardCard
            title="Exam Planner"
            description="Plan upcoming exams & deadlines"
            href="/dashboard/exams"
          />

          <DashboardCard
            title="Alarms"
            description="Set custom alarms for your classes"
            href="/dashboard/alarms"
            comingSoon
          />
        </div>
      </main>
    </div>
  )
}
