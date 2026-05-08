import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { applyPendingMigrations } from '@/lib/pgMigrate';
import { getSupabaseClient } from '@/lib/supabase';
import { getSeedUsers, getSeedRooms } from '@/lib/seedReader';
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

async function seedInitialData(): Promise<{ users: number; rooms: number }> {
  const supabase = getSupabaseClient();
  const seedUsers = await getSeedUsers();
  const seedRooms = await getSeedRooms();
  let insertedUsers = 0;
  let insertedRooms = 0;

  for (const seedUser of seedUsers) {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', seedUser.email)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('users').insert({
        email: seedUser.email,
        name: seedUser.name,
        role: seedUser.role,
        password_hash: seedUser.password_hash,
        must_change_password: false,
        disabled: false,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
      insertedUsers += 1;
    }
  }

  for (const seedRoom of seedRooms) {
    const { data: existing, error: existingError } = await supabase
      .from('rooms')
      .select('id')
      .eq('number', seedRoom.number)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('rooms').insert({
        number: seedRoom.number,
        type: seedRoom.type,
        price_per_night: seedRoom.price_per_night,
        status: 'disponible',
        is_active: true,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
      insertedRooms += 1;
    }
  }

  return { users: insertedUsers, rooms: insertedRooms };
}

async function handler(_request: NextRequest, _user: JwtPayload): Promise<Response> {
  const secret = _request.headers.get('x-bootstrap-secret');
  if (secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return createJsonResponse({ error: 'Secreto de bootstrap inválido' }, 403);
  }

  const migrationResult = await applyPendingMigrations();
  const seedResult = await seedInitialData();

  return createJsonResponse({
    success: true,
    migrations: migrationResult,
    seed: seedResult,
  });
}

export const POST = withAuth(withRole(handler, ['admin']));
