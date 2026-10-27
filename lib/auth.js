import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE  = 'cafein_admin';
const MAX_AGE = 7 * 24 * 60 * 60;

function secret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'cafein-dev-secret-change-before-deploy'
  );
}

export async function signToken() {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar   = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   MAX_AGE,
    path:     '/',
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, '', { maxAge: 0, path: '/' });
}
