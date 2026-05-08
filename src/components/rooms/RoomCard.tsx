'use client';

import Link from 'next/link';
import type { RoomWithActiveGuest } from '@/lib/types';
import RoomStatusBadge from './RoomStatusBadge';

interface Props {
  room: RoomWithActiveGuest;
  isAdmin: boolean;
}

export default function RoomCard({ room, isAdmin }: Props) {
  const occupied = room.status === 'ocupada';
  return (
    <article className={`rounded-3xl border p-6 shadow-xl transition ${occupied ? 'border-rose-500/20 bg-rose-950/90' : 'border-emerald-500/20 bg-emerald-950/90'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Habitación</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{room.number}</h2>
          <p className="mt-1 text-sm text-slate-300">{room.type}</p>
        </div>
        <RoomStatusBadge room={room} />
      </div>

      <div className="mt-6 space-y-4 text-sm text-slate-200">
        {occupied ? (
          <div className="rounded-3xl bg-slate-950/60 p-4">
            <p className="text-slate-400">Estado ocupado</p>
            <p className="mt-2 text-white">Huésped activo: {room.activeGuestName ?? 'Información en proceso'}</p>
            <p className="mt-1 text-slate-400">Salida estimada: {room.expectedCheckoutDate ?? '—'}</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-950/60 p-4">
            <p className="text-slate-400">Precio por noche</p>
            <p className="mt-2 text-3xl font-semibold text-white">S/ {room.price_per_night.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {occupied ? (
          <Link
            href={room.activeBookingId ? `/checkout/${encodeURIComponent(room.activeBookingId)}` : `/checkout/${encodeURIComponent(room.id)}`}
            className="rounded-2xl bg-rose-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-rose-400"
          >
            Checkout
          </Link>
        ) : (
          <Link href={`/checkin?roomId=${encodeURIComponent(room.id)}`} className="rounded-2xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Registrar Check-in
          </Link>
        )}

        {isAdmin ? (
          <Link href={`/rooms/${room.id}/edit`} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-slate-500">
            Editar habitación
          </Link>
        ) : null}
      </div>
    </article>
  );
}
