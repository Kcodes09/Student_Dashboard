import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import master from "@/data/mastertt.json"

import Navbar from "../../components/Navbar"
import TimetableClient from "./TimetableClient"

export default async function TimetablePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session!.user} />

      <TimetableClient master={master} />
    </div>
  )
}






