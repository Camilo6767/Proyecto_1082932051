'use client';

import type { RoomWithActiveGuest } from '@/lib/types';

interface Props {
  room: RoomWithActiveGuest;
}

export default function RoomStatusBadge({ room }: Props) {
  if (room.status === 'disponible') {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
        Disponible
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
      Ocupada
    </span>
  );
}
