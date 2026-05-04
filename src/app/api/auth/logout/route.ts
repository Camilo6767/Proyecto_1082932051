import { NextRequest } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(_request: NextRequest) {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
      'Cache-Control': 'no-store',
    },
  });
}
