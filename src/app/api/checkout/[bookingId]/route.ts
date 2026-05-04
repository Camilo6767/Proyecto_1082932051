import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { checkOut } from '@/lib/dataService';
import { type JwtPayload } from '@/lib/types';

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function handlePost(request: NextRequest, user: JwtPayload) {
  const url = new URL(request.url);
  const bookingId = url.pathname.split('/').pop();

  if (!bookingId) {
    return createJsonResponse({ error: 'ID de reserva requerido.' }, 400);
  }

  try {
    const booking = await checkOut(user.sub, bookingId);
    return createJsonResponse({ booking }, 200);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const POST = withAuth(handlePost);
