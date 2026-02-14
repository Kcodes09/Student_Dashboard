import Navbar from "@/app/components/Navbar"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export default async function CGPA() {

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const email = session.user.email
  const tt = await prisma.timetable.findUnique({
    where: { userEmail: email },
  })
  const selectedSections =
    (tt?.data as Record<string, any>) ?? {}
  return (
    <>
      <Navbar user={{ email }} />
      <div className="p-4">
        <h1 className="text-xl font-bold">CGPA</h1>
        <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(selectedSections, null, 2)}
        </pre>
      </div>
    </>
  )
}