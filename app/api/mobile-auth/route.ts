import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const google = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // 1. Verify Google ID token
    const ticket = await google.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_ANDROID_CLIENT_ID!,
        process.env.GOOGLE_WEB_CLIENT_ID!,
      ],
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const email = payload.email!;
    const name = payload.name!;
    const picture = payload.picture || "";

    // 2. Domain restriction
    if (!email.endsWith("@hyderabad.bits-pilani.ac.in")) {
      return NextResponse.json({ error: "Unauthorized domain" }, { status: 403 });
    }

    // 3. Create/update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, image: picture },
      create: { email, name, image: picture },
    });

    // 4. Create JWT for mobile
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return NextResponse.json({ ok: true, token, user });
  } catch (err: any) {
    console.error("Mobile-auth error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
