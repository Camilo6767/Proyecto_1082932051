import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { updateUser, deleteUser, resetUserPassword } from '@/lib/dataService';
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

async function handlePut(request: NextRequest, user: JwtPayload): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[3];

  if (!id) {
    return createJsonResponse({ error: 'ID de usuario requerido.' }, 400);
  }

  try {
    const body = await request.json();
    const { name, role, disabled } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) {
      if (!['admin', 'recepcionista'].includes(role)) {
        return createJsonResponse({ error: 'Rol inválido.' }, 400);
      }
      updates.role = role;
    }
    if (disabled !== undefined) updates.disabled = disabled;

    const updatedUser = await updateUser(id, updates);
    return createJsonResponse({ user: updatedUser });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

async function handleDelete(request: NextRequest, user: JwtPayload): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[3];

  if (!id) {
    return createJsonResponse({ error: 'ID de usuario requerido.' }, 400);
  }

  try {
    await deleteUser(id);
    return createJsonResponse({ message: 'Usuario eliminado.' });
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

async function handlePatch(request: NextRequest, user: JwtPayload): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[3];

  if (!id) {
    return createJsonResponse({ error: 'ID de usuario requerido.' }, 400);
  }

  try {
    const body = await request.json();
    const { action, newPassword } = body;

    if (action === 'reset_password') {
      if (!newPassword) {
        return createJsonResponse({ error: 'Nueva contraseña requerida.' }, 400);
      }
      const passwordHash = await hashPassword(newPassword);
      await resetUserPassword(id, passwordHash);
      return createJsonResponse({ message: 'Contraseña reseteada.' });
    }

    return createJsonResponse({ error: 'Acción no válida.' }, 400);
  } catch (error) {
    return createJsonResponse({ error: (error as Error).message }, 400);
  }
}

export const PUT = withAuth(withRole(handlePut, ['admin']));
export const DELETE = withAuth(withRole(handleDelete, ['admin']));
export const PATCH = withAuth(withRole(handlePatch, ['admin']));