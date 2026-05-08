import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { changePassword, getSystemMode } from '@/lib/dataService';
import { type JwtPayload } from '@/lib/types';

async function handler(request: NextRequest, user: JwtPayload): Promise<Response> {
  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!newPassword) {
    return new Response(JSON.stringify({ error: 'Nueva contraseña requerida' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  if ((await getSystemMode()) === 'seed') {
    return new Response(JSON.stringify({ error: 'El sistema está en modo seed. Ejecuta el bootstrap primero.' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  try {
    const updatedUser = await changePassword(user.sub, newPassword);
    return new Response(JSON.stringify({ user: updatedUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}

export const POST = withAuth(handler);
