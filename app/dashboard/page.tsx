import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import { redirect } from "next/navigation"
import Navbar from "../components/Navbar"
import DashboardCard from "../components/DashboardCard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar user={session.user} />

      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        <h1 className="mb-6 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          Welcome, {session.user?.name}
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <DashboardCard
            title="Attendance"
            description="Track your attendance percentage"
            href="/dashboard/attendance"
          />

          <DashboardCard
            title="Classes"
            description="See when classes begin and today’s schedule"
            href="/dashboard/classes"
          />

          <DashboardCard
            title="Exam Planner"
            description="Plan upcoming exams & deadlines"
            href="/dashboard/exams"
          />

          <DashboardCard
            title="Profile"
            description="View your account details"
            href="/dashboard/profile"
          />

          <DashboardCard
            title="Timetable"
            description="View classes, mark attendance & plan skips"
            href="/dashboard/timetable"
          />

          <DashboardCard
            title="Calendar"
            description="View classes, exams, and holidays in a monthly calendar"
            href="/dashboard/calendar"
          />
        </div>
      </main>
    </div>
  )
}
