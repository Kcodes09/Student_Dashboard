import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({})
  }

  const filePath = path.join(
    process.cwd(),
    "data",
    "timetables",
    `${session.user.id}.json`
  )

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({})
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  return NextResponse.json(data)
}
