import jwt from "jsonwebtoken";

// Define JWT payload shape inside same file
export interface MobileJWTPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export function verifyMobileJWT(token?: string): MobileJWTPayload | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // jwt.verify may return a string → ignore
    if (typeof decoded === "string") return null;

    return decoded as MobileJWTPayload;
  } catch (err) {
    return null;
  }
}
