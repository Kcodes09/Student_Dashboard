import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { courseCode, date } = await req.json()

  try {
    await prisma.attendance.create({
      data: {
        userEmail: session.user.email,
        courseCode,
        date: (() => {
          const [y, m, d] = date.split("-").map(Number);
          return new Date(Date.UTC(y, m - 1, d));
        })(),
      },
    })

    // @ts-expect-error Next.js 15+ canary expects 2 arguments but runtime only needs 1
    revalidateTag(`attendance-${session.user.email}`)

    return NextResponse.json({ ok: true })
  } catch (e) {
    // Duplicate = already marked
    return NextResponse.json({ ok: false })
  }
}

