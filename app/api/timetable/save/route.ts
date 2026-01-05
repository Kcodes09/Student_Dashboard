import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const email = session.user.email

    // 🛡️ Preserve old behavior: accept ANY JSON
    const body = await req.json()

    // Extract actual timetable object safely
    const data =
      body?.data && typeof body.data === "object"
        ? body.data
        : body

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid timetable payload" },
        { status: 400 }
      )
    }

    /* ---------- NEW TT COURSES ---------- */
    const newCourses = Object.keys(data)

    /* ---------- EXISTING TT ---------- */
    const existingTT = await prisma.timetable.findUnique({
      where: { userEmail: email },
      select: { data: true },
    })

    const oldCourses = existingTT
      ? Object.keys(existingTT.data as Record<string, any>)
      : []

    /* ---------- REMOVED COURSES ---------- */
    const removedCourses = oldCourses.filter(
      c => !newCourses.includes(c)
    )

    /* ---------- DELETE DEPENDENT EXAMS ---------- */
    if (removedCourses.length > 0) {
      await prisma.exam.deleteMany({
        where: {
          userEmail: email,
          courseCode: { in: removedCourses },
        },
      })
    }

    /* ---------- UPSERT TIMETABLE ---------- */
    await prisma.timetable.upsert({
      where: { userEmail: email },
      update: { data },
      create: {
        userEmail: email,
        data,
      },
    })

    return NextResponse.json({
      ok: true,
      removedCourses,
    })
  } catch (err) {
    console.error("SAVE TT ERROR:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
