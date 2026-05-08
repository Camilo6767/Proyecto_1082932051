'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoomGrid from '@/components/rooms/RoomGrid';
import type { RoomWithActiveGuest, Role } from '@/lib/types';

type MeResponse = { user: { role: Role } };

type RoomsResponse = { rooms: RoomWithActiveGuest[] };

export default function CheckoutPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomWithActiveGuest[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [meResponse, roomsResponse] = await Promise.all([
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/rooms', { cache: 'no-store' }),
        ]);

        if (meResponse.status === 401 || roomsResponse.status === 401) {
          router.replace('/login');
          return;
        }

        if (!meResponse.ok || !roomsResponse.ok) {
          const result = await roomsResponse.json().catch(() => null);
          setError(result?.error || 'No se pudieron cargar las habitaciones.');
          return;
        }

        const meData = (await meResponse.json()) as MeResponse;
        const roomsData = (await roomsResponse.json()) as RoomsResponse;
        setRole(meData.user.role);
        setRooms(roomsData.rooms.filter((room) => room.status === 'ocupada'));
      } catch {
        setError('Error de conexión al cargar las habitaciones.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">Cargando habitaciones ocupadas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-rose-400/80">Check-out</p>
              <h1 className="text-3xl font-semibold text-white">Habitaciones ocupadas</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Selecciona una habitación para registrar el check-out y calcular el total a cobrar.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">
            <p>{error}</p>
          </section>
        ) : null}

        <RoomGrid rooms={rooms} isAdmin={role === 'admin'} />
      </div>
    </main>
  );
}
