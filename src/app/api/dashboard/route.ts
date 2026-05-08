import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getSupabaseClient } from '@/lib/supabase';
import { getSystemMode } from '@/lib/dataService';
import { getSeedRooms } from '@/lib/seedReader';
import { type JwtPayload } from '@/lib/types';

function createJsonResponse(body: unknown, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function handler(_request: Request, user: JwtPayload) {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const rooms = await getSeedRooms();
    return createJsonResponse({
      mode: 'seed',
      role: user.role,
      totalRooms: rooms.length,
      availableCount: rooms.length,
      occupiedCount: 0,
      todayIncome: null,
    });
  }

  const supabase = getSupabaseClient();
  const [availableResponse, occupiedResponse] = await Promise.all([
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'disponible')
      .eq('is_active', true),
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ocupada')
      .eq('is_active', true),
  ]);

  const availableCount = availableResponse.count ?? 0;
  const occupiedCount = occupiedResponse.count ?? 0;
  const totalRooms = availableCount + occupiedCount;
  let todayIncome: number | null = null;

  if (user.role === 'admin') {
    try {
      const today = new Date();
      const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
      const { data, error } = await supabase
        .from('bookings')
        .select('total_amount', { count: 'exact' })
        .gte('checkout_at', startOfDay.toISOString())
        .lt('checkout_at', endOfDay.toISOString());

      if (!error && Array.isArray(data)) {
        todayIncome = data.reduce((sum, entry) => sum + Number((entry as { total_amount: number }).total_amount || 0), 0);
      }
    } catch {
      todayIncome = null;
    }
  }

  return createJsonResponse({
    mode: 'live',
    role: user.role,
    totalRooms,
    availableCount,
    occupiedCount,
    todayIncome,
  });
}

export const GET = withAuth(handler);
