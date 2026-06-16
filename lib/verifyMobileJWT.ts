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
  // 1. BYPASS MODE (Check this FIRST)
  if (process.env.SKIP_MOBILE_AUTH === "true") {
    console.warn("⚠️ SKIPPING JWT VERIFICATION (Unsafe Mode) - Returning Mock User");
    return {
      id: "mock-user-id",
      email: "f20220000@hyderabad.bits-pilani.ac.in",
      name: "Mock User",
    };
  }

  if (!token || token === "null" || token === "undefined") return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // jwt.verify may return a string → ignore
    if (typeof decoded === "string") return null;

    return decoded as MobileJWTPayload;
  } catch (err) {
    const error = err as any;
    console.error("JWT Verify Error:", error.message, error.name);

    // UNSAFE FALLBACK for debugging
    if (process.env.SKIP_MOBILE_AUTH === "true") {
      console.warn("⚠️ SKIPPING JWT VERIFICATION (Unsafe Mode) - Attempting to decode...");
      const unsafe = jwt.decode(token);
      if (unsafe && typeof unsafe !== "string") {
        console.log("Unsafe Decode Success:", (unsafe as any).email);
        return unsafe as MobileJWTPayload;
      }

      // If decode fails (or token is garbage), return MOCK USER
      console.warn("⚠️ TOKEN INVALID even for decode. Returning MOCK USER.");
      return {
        id: "mock-user-id",
        email: "f20220000@hyderabad.bits-pilani.ac.in", // Default mock email
        name: "Mock User",
      };
    }

    return null;
  }
}
