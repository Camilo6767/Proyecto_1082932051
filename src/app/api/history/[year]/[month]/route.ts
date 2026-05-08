import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getCompletedBookingsByMonth } from '@/lib/dataService';
import { type JwtPayload } from '@/lib/types';

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function handler(request: NextRequest, user: JwtPayload): Promise<Response> {
  const url = new URL(request.url);
  const year = url.pathname.split('/')[3];
  const month = url.pathname.split('/')[4];

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return createJsonResponse({ error: 'Año y mes inválidos.' }, 400);
  }

  try {
    const bookings = await getCompletedBookingsByMonth(yearNum, monthNum);
    const totalIncome = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);

    return createJsonResponse({
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalIncome,
        month: monthNum,
        year: yearNum,
      },
    }, 200);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 500);
  }
}

export const GET = withAuth(withRole(handler, ['admin', 'recepcionista']));