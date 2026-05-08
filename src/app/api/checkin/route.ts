import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { checkIn } from '@/lib/dataService';
import { checkInSchema } from '@/lib/checkinSchemas';
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

async function handlePost(request: NextRequest, _user: JwtPayload) {
  const body = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(body);

  if (!parsed.success) {
    return createJsonResponse({ error: parsed.error.issues.map((item) => item.message).join(', ') }, 400);
  }

  try {
    const booking = await checkIn(parsed.data);
    return createJsonResponse({ booking }, 201);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const POST = withAuth(handlePost);
