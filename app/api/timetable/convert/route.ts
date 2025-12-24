import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { normalizeMasterTT } from "../../../lib/timetable/normalizeMasterTT"

export async function POST() {
  try {
    const inputPath = path.join(process.cwd(), "data", "uploaded.json")
    const outputPath = path.join(process.cwd(), "data", "mastertt.json")

    const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"))
    const master = normalizeMasterTT(raw)

    fs.writeFileSync(outputPath, JSON.stringify(master, null, 2))

    return NextResponse.json({
      success: true,
      message: "mastertt.json generated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Failed to generate master timetable" },
      { status: 500 }
    )
  }
}

