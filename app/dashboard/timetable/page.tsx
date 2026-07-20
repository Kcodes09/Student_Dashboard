import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import master from "@/data/mastertt.json"

import Navbar from "../../components/Navbar"
import TimetableClient from "./TimetableClient"

import TimetableDashboard from "./TimetableDashboard"

import { redirect } from "next/navigation"

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  
  const params = await searchParams

  return (
    <div className="sticky top-0 bg-[var(--bg-surface)] flex flex-col h-screen overflow-hidden">
      <Navbar user={session.user} />

      {params?.id ? (
        <TimetableClient master={master} timetableId={params.id} />
      ) : (
        <TimetableDashboard userEmail={session.user?.email} />
      )}
    </div>
  )
}






