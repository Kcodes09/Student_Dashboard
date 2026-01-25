export interface MobileJWTPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
