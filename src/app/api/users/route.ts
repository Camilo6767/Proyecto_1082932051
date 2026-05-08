import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getAllUsers, createUser } from '@/lib/dataService';
import { hashPassword } from '@/lib/auth';
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

async function handleGet(request: NextRequest, user: JwtPayload): Promise<Response> {
  try {
    const users = await getAllUsers();
    return createJsonResponse({ users });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 500);
  }
}

async function handlePost(request: NextRequest, user: JwtPayload): Promise<Response> {
  try {
    const body = await request.json();
    const { email, name, role, password } = body;

    if (!email || !name || !role || !password) {
      return createJsonResponse({ error: 'Todos los campos son requeridos.' }, 400);
    }

    if (!['admin', 'recepcionista'].includes(role)) {
      return createJsonResponse({ error: 'Rol inválido.' }, 400);
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUser(email, name, role, passwordHash);

    return createJsonResponse({ user: newUser }, 201);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const GET = withAuth(withRole(handleGet, ['admin']));
export const POST = withAuth(withRole(handlePost, ['admin']));