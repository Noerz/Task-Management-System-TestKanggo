/**
 * Lightweight JWT payload decoder (no signature verification).
 * We only decode client-side to read the `exp` field.
 * The real security verification happens on the backend.
 */

interface JwtPayload {
  exp?: number;
  userId?: string;
  email?: string;
  iat?: number;
}

/**
 * Decode a JWT without verifying the signature.
 * Returns null if the token is malformed.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64Url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Returns true if the token exists and has NOT expired yet.
 * Adds a 10-second buffer to account for clock skew.
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  const payload = decodeJwt(token);
  if (!payload?.exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds + 10; // 10s grace period
};
