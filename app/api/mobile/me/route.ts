import { NextResponse } from "next/server";
import { verifyMobileJWT } from "@/lib/verifyMobileJWT";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyMobileJWT(token);

  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
  });

  return NextResponse.json({ user });
}
