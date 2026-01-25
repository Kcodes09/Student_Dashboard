import jwt from "jsonwebtoken";
import { MobileJWTPayload } from "@/lib/types";

export function verifyMobileJWT(token?: string): MobileJWTPayload | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string") return null;

    return decoded as MobileJWTPayload;
  } catch (err) {
    return null;
  }
}
