'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { RoomWithActiveGuest } from '@/lib/types';

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomWithActiveGuest | null>(null);
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    const roomId = id;

    async function loadRoom() {
      try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          setError(result?.error || 'No se pudo cargar la habitación.');
          return;
        }

        const data = await response.json();
        setRoom(data.room);
        setType(data.room.type);
        setPrice(String(data.room.price_per_night));
      } catch {
        setError('Error de conexión al cargar la habitación.');
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [id, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    const priceValue = Number(price);
    if (!type || Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Completa los campos correctamente.');
      setSaving(false);
      return;
    }

    if (Array.isArray(id)) {
      setError('ID de habitación inválido.');
      setSaving(false);
      return;
    }

    const roomId = id;
    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, price_per_night: priceValue }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || 'No se pudo actualizar la habitación.');
        return;
      }

      setSuccess('Habitación actualizada correctamente.');
      setTimeout(() => router.push('/rooms'), 1000);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">Cargando datos de la habitación...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-rose-300">No se encontró la habitación solicitada.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Editar habitación {room.number}</h1>
          <p className="mt-2 text-sm text-slate-400">Actualiza el tipo o precio de la habitación disponible.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-300">Número</label>
                <input
                  value={room.number}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none"
                />
              </div>

              <label className="block">
                <span className="text-sm text-slate-300">Tipo</span>
                <input
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-300">Precio por noche</span>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Guardando cambios...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/rooms')}
                className="inline-flex w-full justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 sm:w-auto"
              >
                Volver a habitaciones
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
