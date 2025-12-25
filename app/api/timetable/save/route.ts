import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()

  const filePath = path.join(
    process.cwd(),
    "data",
    "timetables",
    `${session.user.id}.json`
  )

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

  return NextResponse.json({ success: true })
}
