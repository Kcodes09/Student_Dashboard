import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Load Google client
const google = new OAuth2Client();
console.log("MOBILE AUTH API HIT");

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // 1. Verify Google ID Token
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

    console.log("GOOGLE PAYLOAD:", payload);

    const email = payload.email!;
    const name = payload.name ?? "";
    const avatar = payload.picture ?? "";
      console.log("GOOGLE PAYLOAD EMAIL:", email);

    // 2. HARD DOMAIN CHECK (server-side)
    if (!email.endsWith("@hyderabad.bits-pilani.ac.in")) {
      console.log("BLOCKED LOGIN:", email);

      return NextResponse.json(
        { error: "Only BITS Hyderabad accounts are allowed." },
        { status: 403 }
      );
    }

    // 3. Upsert user in Prisma
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, image: avatar },
      create: { email, name, image: avatar },
    });

    // 4. Create mobile-safe JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    console.log("LOGIN SUCCESS:", user.email);

    // 5. Return token + user object
    return NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (err: any) {
    console.error("MOBILE AUTH ERROR:", err);

    return NextResponse.json(
      { error: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
