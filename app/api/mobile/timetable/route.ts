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

  const tt = await prisma.timetable.findUnique({
    where: { userEmail: decoded.email },
  });

  return NextResponse.json(tt?.data ?? {});
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer "))
    return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const decoded = verifyMobileJWT(auth.split(" ")[1]);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const body = await req.json();
  const data = body?.data && typeof body.data === "object" ? body.data : body;

  if (!data || typeof data !== "object")
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const newCourses = Object.keys(data);

  const existing = await prisma.timetable.findUnique({
    where: { userEmail: decoded.email },
    select: { data: true },
  });

  const oldCourses = existing
    ? Object.keys(existing.data as Record<string, any>)
    : [];

  const removed = oldCourses.filter((c) => !newCourses.includes(c));

  if (removed.length > 0) {
    await prisma.exam.deleteMany({
      where: { userEmail: decoded.email, courseCode: { in: removed } },
    });
  }

  await prisma.timetable.upsert({
    where: { userEmail: decoded.email },
    update: { data },
    create: { userEmail: decoded.email, data },
  });

  return NextResponse.json({ ok: true, removedCourses: removed });
}
