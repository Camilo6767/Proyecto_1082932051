import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { type JwtPayload } from '@/lib/types';

async function handler(_request: NextRequest, user: JwtPayload): Promise<Response> {
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = withAuth(handler);
