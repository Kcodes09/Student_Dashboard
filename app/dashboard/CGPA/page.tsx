import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export default async function CGPA(){
    
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) return null
    const email=session.user.email
      const tt = await prisma.timetable.findUnique({
    where: { userEmail: email },
  })
    const selectedSections =
    (tt?.data as Record<string, any>) ?? {}
    return{
        selectedSections
    }
}