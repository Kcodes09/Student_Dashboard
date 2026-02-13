import { NextResponse } from "next/server";
import { verifyMobileJWT } from "@/lib/verifyMobileJWT";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
        return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = verifyMobileJWT(auth.split(" ")[1]);
    if (!decoded)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const records = await prisma.attendance.findMany({
        where: { userEmail: decoded.email },
    });

    return NextResponse.json(records);
}

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
        return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = verifyMobileJWT(auth.split(" ")[1]);
    if (!decoded)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { courseCode, date } = await req.json();

    try {
        await prisma.attendance.create({
            data: {
                userEmail: decoded.email,
                courseCode,
                date: new Date(date),
            },
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false });
    }
}
