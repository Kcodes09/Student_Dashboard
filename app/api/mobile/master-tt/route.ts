import { NextResponse } from "next/server";
import masterTT from "@/data/mastertt.json";

export async function GET() {
    return NextResponse.json(masterTT);
}
