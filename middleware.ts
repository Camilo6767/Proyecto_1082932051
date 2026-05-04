import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET ?? '';

export const config = {
  matcher: ['/dashboard', '/admin/:path*'],
};

async function verifySessionToken(token: string) {
  return jwtVerify(token, new TextEncoder().encode(jwtSecret));
}

export async function middleware(request: NextRequest) {
  if (!jwtSecret) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const sessionCookie = request.cookies.get('hostdesk_session')?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await verifySessionToken(sessionCookie);
    const role = typeof payload.role === 'string' ? payload.role : '';

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
