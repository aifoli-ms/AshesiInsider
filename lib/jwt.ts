import crypto from 'crypto';

type JwtPayload = Record<string, unknown>;

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwtHS256(payload: JwtPayload, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest();
  const encodedSignature = base64url(signature);
  return `${data}.${encodedSignature}`;
}

export function verifyJwtHS256<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string
): { valid: boolean; payload?: T } {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest());
  if (expected !== signature) return { valid: false };
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString()) as T;
    if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}


