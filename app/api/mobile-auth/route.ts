import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const session = {
      email: payload.email!,
      name: payload.name!,
      token: idToken,
    };

    return NextResponse.json(session);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
