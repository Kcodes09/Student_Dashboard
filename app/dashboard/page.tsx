import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Navbar from "../components/Navbar"
import DashboardCard from "../components/DashboardCard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] bg-[var(--bg-main)] ">

      <Navbar user={session.user} />

      <main className="p-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">
          Welcome, {session.user?.name}
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Attendance"
            description="Track your attendance percentage"
            href="/dashboard/attendance"
          />

          <DashboardCard
            title="Exam Planner"
            description="Plan upcoming exams & deadlines"
            href="/dashboard/planner"
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

        </div>
      </main>
    </div>
  )
}



