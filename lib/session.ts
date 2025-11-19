import { signJwtHS256, verifyJwtHS256 } from './jwt';

export const SESSION_COOKIE = 'session';
export const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export type SessionClaims = {
  sub: number;
  email: string;
  firstName?: string;
  profileType?: string;
  exp: number;
};

function getSecret(): string {
  return process.env.JWT_SECRET || 'dev-secret';
}

export function createSessionToken(claims: Omit<SessionClaims, 'exp'>) {
  const exp = Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS;
  return signJwtHS256({ ...claims, exp }, getSecret());
}

export function parseSessionToken(token: string): SessionClaims | null {
  const { valid, payload } = verifyJwtHS256<SessionClaims>(token, getSecret());
  return valid ? (payload as SessionClaims) : null;
}


