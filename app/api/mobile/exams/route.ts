import { NextResponse } from "next/server";
import { verifyMobileJWT } from "@/lib/verifyMobileJWT";
import { prisma } from "@/lib/prisma";
import officialExams from "@/lib/data/exams_normalized.json";

function normalizeCourseCode(code: string) {
    return code.replace(/\s+/g, "").toUpperCase();
}

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
        return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = verifyMobileJWT(auth.split(" ")[1]);
    if (!decoded)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const tt = await prisma.timetable.findUnique({
        where: { userEmail: decoded.email },
    });

    const ttCourses = tt
        ? Object.entries(tt.data as Record<string, any>)
            .filter(
                ([_, v]) => v && typeof v === "object" && Object.keys(v).length > 0
            )
            .map(([code]) => normalizeCourseCode(code))
        : [];

    const userExamsRaw = await prisma.exam.findMany({
        where: { userEmail: decoded.email },
    });

    const userExams = userExamsRaw
        .filter((e) => ttCourses.includes(normalizeCourseCode(e.courseCode)))
        .map((e) => ({
            id: e.id,
            courseCode: e.courseCode,
            courseTitle: e.courseTitle,
            type: e.type,
            date: `${e.date.getDate().toString().padStart(2, "0")}/${(
                e.date.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}`,
            startTime: e.startTime,
            endTime: e.endTime,
        }));

    const official = (officialExams as any[])
        .filter((e: any) => ttCourses.includes(normalizeCourseCode(e.courseCode)))
        .map((e: any) => ({
            courseCode: e.courseCode,
            courseTitle: e.courseTitle ?? "",
            type: e.type,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime,
        }));

    return NextResponse.json({ official, userExams });
}

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
        return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = verifyMobileJWT(auth.split(" ")[1]);
    if (!decoded)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { courseCode, courseTitle, type, date, startTime, endTime } =
        await req.json();
    const [year, month, day] = date.split("-").map(Number);

    const exam = await prisma.exam.create({
        data: {
            courseCode,
            courseTitle,
            type,
            date: new Date(year, month - 1, day),
            startTime,
            endTime,
            userEmail: decoded.email,
        },
    });

    return NextResponse.json(exam);
}

export async function DELETE(req: Request) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
        return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = verifyMobileJWT(auth.split(" ")[1]);
    if (!decoded)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { id } = await req.json();

    await prisma.exam.deleteMany({
        where: { id, userEmail: decoded.email },
    });

    return NextResponse.json({ ok: true });
}
