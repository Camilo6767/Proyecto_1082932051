import { type NextRequest } from 'next/server';
import { getUserCredentialsByEmail } from '@/lib/dataService';
import { verifyPassword, createJWT, createSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  const user = await getUserCredentialsByEmail(email);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword || user.disabled) {
    return new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  const token = await createJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    must_change_password: user.must_change_password ?? false,
  });

  return new Response(JSON.stringify({ user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    must_change_password: user.must_change_password ?? false,
  } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': createSessionCookie(token),
      'Cache-Control': 'no-store',
    },
  });
}
