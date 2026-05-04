import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { JwtPayload, Role } from './types';

const SESSION_COOKIE_NAME = 'hostdesk_session';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '8h';

if (!JWT_SECRET) {
  console.warn('JWT_SECRET no configurado. El login no funcionará sin esta variable.');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function createJWT(payload: Omit<JwtPayload, 'exp'>): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado.');
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyJWT(token: string): Promise<JwtPayload> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado.');
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
    name: String(payload.name),
    must_change_password: payload.must_change_password === true,
  };
}

export function createSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 8;
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge};${secure ? ' Secure;' : ''}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;${secure ? ' Secure;' : ''}`;
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((item) => item.trim());
  const sessionCookie = cookies.find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

export function createUnauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'No autorizado' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

export function createForbiddenResponse(): Response {
  return new Response(JSON.stringify({ error: 'Sin permisos' }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
