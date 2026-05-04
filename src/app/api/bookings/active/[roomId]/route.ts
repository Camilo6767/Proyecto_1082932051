import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getActiveBooking } from '@/lib/dataService';
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

async function handleGet(request: NextRequest, _user: JwtPayload) {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/').pop();

  if (!roomId) {
    return createJsonResponse({ error: 'ID de habitación requerido.' }, 400);
  }

  try {
    const booking = await getActiveBooking(roomId);
    if (!booking) {
      return createJsonResponse({ error: 'No hay reserva activa para esta habitación.' }, 404);
    }
    return createJsonResponse({ booking });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const GET = withAuth(handleGet);
