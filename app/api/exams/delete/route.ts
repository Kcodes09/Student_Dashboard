import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    const { id } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Exam id is required" }),
        { status: 400 }
      )
    }

    // 🔐 Delete ONLY exams belonging to this user
    await prisma.exam.deleteMany({
      where: {
        id,
        userEmail: session.user.email,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (err) {
    console.error("Delete exam error:", err)

    return new Response(
      JSON.stringify({ error: "Failed to delete exam" }),
      { status: 500 }
    )
  }
}
