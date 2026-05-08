import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getSystemMode } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase';
import { readAuditMonth } from '@/lib/blobAudit';
import { getAppliedMigrationNames, loadMigrationFiles } from '@/lib/pgMigrate';
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

async function handler(_request: NextRequest, _user: JwtPayload): Promise<Response> {
  const mode = await getSystemMode();
  const result: Record<string, unknown> = { mode };

  if (mode === 'seed') {
    return createJsonResponse({ ...result, seed: true });
  }

  const supabase = getSupabaseClient();
  const diagnostics: Record<string, unknown> = {};

  try {
    const { error: userError, count: usersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    diagnostics.supabase = {
      ok: !userError,
      error: userError?.message ?? null,
      usersCount: usersCount ?? 0,
    };
  } catch (error) {
    diagnostics.supabase = {
      ok: false,
      error: (error as Error).message,
    };
  }

  try {
    const { error: roomsError, count: roomsCount } = await supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true });
    diagnostics.rooms = {
      ok: !roomsError,
      error: roomsError?.message ?? null,
      roomsCount: roomsCount ?? 0,
    };
  } catch (error) {
    diagnostics.rooms = {
      ok: false,
      error: (error as Error).message,
    };
  }

  try {
    const now = new Date();
    const currentMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const entries = await readAuditMonth(currentMonth);
    diagnostics.blob = {
      ok: true,
      error: null,
      entriesCount: entries.length,
    };
  } catch (error) {
    diagnostics.blob = {
      ok: false,
      error: (error as Error).message,
    };
  }

  try {
    const applied = await getAppliedMigrationNames();
    const all = await loadMigrationFiles();
    diagnostics.migrations = {
      applied: applied.length,
      pending: Math.max(0, all.length - applied.length),
      total: all.length,
    };
  } catch (error) {
    diagnostics.migrations = {
      ok: false,
      error: (error as Error).message,
    };
  }

  return createJsonResponse({ ...result, diagnostics });
}

export const GET = withAuth(withRole(handler, ['admin']));
