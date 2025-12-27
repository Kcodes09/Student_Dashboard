import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import master from "@/data/mastertt.json"

import Navbar from "../../components/Navbar"
import TimetableClient from "./TimetableClient"

export default async function TimetablePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="sticky top-0 bg-[var(--bg-surface)] ">

      
      <Navbar user={session!.user} />

      <TimetableClient master={master} />
    </div>
  )
}






