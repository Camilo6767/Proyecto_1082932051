import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getBookingById } from '@/lib/dataService';
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
  const id = url.pathname.split('/').pop();

  if (!id) {
    return createJsonResponse({ error: 'ID de reserva requerido.' }, 400);
  }

  try {
    const booking = await getBookingById(id);
    if (!booking) {
      return createJsonResponse({ error: 'Reserva no encontrada.' }, 404);
    }
    return createJsonResponse({ booking });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const GET = withAuth(handleGet);
