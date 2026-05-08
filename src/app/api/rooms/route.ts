import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { createRoomSchema } from '@/lib/roomSchemas';
import { createRoom, getRooms } from '@/lib/dataService';
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

async function handleGet(_request: NextRequest, _user: JwtPayload) {
  const rooms = await getRooms();
  return createJsonResponse({ rooms });
}

async function handlePost(request: NextRequest, _user: JwtPayload) {
  const body = await request.json().catch(() => null);
  const parsed = createRoomSchema.safeParse(body);

  if (!parsed.success) {
    return createJsonResponse({ error: parsed.error.issues.map((item) => item.message).join(', ') }, 400);
  }

  try {
    const room = await createRoom(parsed.data);
    return createJsonResponse({ room }, 201);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(withRole(handlePost, ['admin']));
