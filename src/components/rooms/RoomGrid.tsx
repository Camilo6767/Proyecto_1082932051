'use client';

import type { RoomWithActiveGuest } from '@/lib/types';
import RoomCard from './RoomCard';

interface Props {
  rooms: RoomWithActiveGuest[];
  isAdmin: boolean;
}

export default function RoomGrid({ rooms, isAdmin }: Props) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 text-slate-300">
        <p className="text-lg font-semibold text-white">No hay habitaciones registradas.</p>
        <p className="mt-2 text-sm text-slate-400">Agrega la primera habitación para comenzar a gestionar el sistema.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
