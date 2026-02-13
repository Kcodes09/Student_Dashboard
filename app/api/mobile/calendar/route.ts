import { NextResponse } from "next/server";
import { verifyMobileJWT } from "@/lib/verifyMobileJWT";
import { prisma } from "@/lib/prisma";

import academicCalendar from "@/lib/data/academic_calendar.json";
import officialExams from "@/lib/data/exams_normalized.json";
import masterTT from "@/data/mastertt.json";
import { generateStudentTT } from "@/app/lib/timetable/generateStudentTT";

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

    const selectedSections = (tt?.data as Record<string, any>) ?? {};

    const selectedCourses = Object.entries(selectedSections)
        .filter(
            ([_, v]) => v && typeof v === "object" && Object.keys(v).length > 0
        )
        .map(([code]) => normalizeCourseCode(code));

    // Sessions
    const rawSessions = generateStudentTT(masterTT, selectedSections);
    const sessions = rawSessions.map((s) => ({
        ...s,
        courseCode: normalizeCourseCode(s.courseCode),
    }));

    // Official exams
    const official = (officialExams as any[])
        .filter((e: any) =>
            selectedCourses.includes(normalizeCourseCode(e.courseCode))
        )
        .map((e: any) => ({
            courseCode: normalizeCourseCode(e.courseCode),
            date: `${academicCalendar.year}-${e.date.split("/").reverse().join("-")}`,
            startTime: e.startTime,
            endTime: e.endTime,
        }));

    // User exams
    const userExamsRaw = await prisma.exam.findMany({
        where: { userEmail: decoded.email },
    });

    const userExams = userExamsRaw
        .filter((e) => selectedCourses.includes(normalizeCourseCode(e.courseCode)))
        .map((e) => ({
            courseCode: normalizeCourseCode(e.courseCode),
            date: e.date.toISOString().slice(0, 10),
            startTime: e.startTime,
            endTime: e.endTime,
        }));

    return NextResponse.json({
        calendar: academicCalendar,
        sessions,
        exams: [...official, ...userExams],
    });
}
