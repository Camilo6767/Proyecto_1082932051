import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getRoomById, updateRoom, deactivateRoom } from '@/lib/dataService';
import { updateRoomSchema } from '@/lib/roomSchemas';
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

function extractRoomId(request: NextRequest): string {
  const path = request.nextUrl.pathname;
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

async function handleGet(request: NextRequest, _user: JwtPayload) {
  const id = extractRoomId(request);
  if (!id) {
    return createJsonResponse({ error: 'ID de habitación no válido.' }, 400);
  }

  const room = await getRoomById(id);
  if (!room) {
    return createJsonResponse({ error: 'Habitación no encontrada.' }, 404);
  }

  return createJsonResponse({ room });
}

async function handlePut(request: NextRequest, _user: JwtPayload) {
  const id = extractRoomId(request);
  if (!id) {
    return createJsonResponse({ error: 'ID de habitación no válido.' }, 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return createJsonResponse({ error: parsed.error.issues.map((item) => item.message).join(', ') }, 400);
  }

  try {
    const room = await updateRoom(id, parsed.data);
    return createJsonResponse({ room });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

async function handleDelete(request: NextRequest, _user: JwtPayload) {
  const id = extractRoomId(request);
  if (!id) {
    return createJsonResponse({ error: 'ID de habitación no válido.' }, 400);
  }

  try {
    await deactivateRoom(id);
    return createJsonResponse({ success: true });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(withRole(handlePut, ['admin']));
export const DELETE = withAuth(withRole(handleDelete, ['admin']));
