'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculateNights, calculateTotal } from '@/lib/bookingService';
import { type Room } from '@/lib/types';

function getLocalDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function CheckInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams?.get('roomId') ?? '';

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(queryRoomId);
  const [guestName, setGuestName] = useState('');
  const [guestIdentification, setGuestIdentification] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInAt, setCheckInAt] = useState(getLocalDateString(new Date()));
  const [checkOutAt, setCheckOutAt] = useState(getLocalDateString(new Date(Date.now() + 1000 * 60 * 60 * 24)));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room.id === selectedRoomId) ?? null,
    [availableRooms, selectedRoomId],
  );

  const nights = useMemo(() => calculateNights(checkInAt, checkOutAt), [checkInAt, checkOutAt]);
  const total = useMemo(() => (selectedRoom ? calculateTotal(selectedRoom.price_per_night, nights) : 0), [selectedRoom, nights]);

  useEffect(() => {
    setSelectedRoomId(queryRoomId);
  }, [queryRoomId]);

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await fetch('/api/rooms');
        const result = await response.json();
        if (!response.ok) {
          setError(result?.error || 'No se pudieron cargar las habitaciones.');
          return;
        }

        setAvailableRooms((result.rooms as Room[]).filter((room) => room.status === 'disponible'));
      } catch {
        setError('Error de conexión al cargar habitaciones.');
      }
    }

    loadRooms();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRoomId) {
      setError('Selecciona una habitación disponible.');
      return;
    }

    if (!guestName || !guestIdentification || !guestPhone) {
      setError('Completa los datos del huésped antes de continuar.');
      return;
    }

    if (nights < 1) {
      setError('La fecha de check-out debe ser posterior a la de check-in.');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedRoomId) {
      setError('Selecciona una habitación disponible.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          guestName,
          guestIdentification,
          guestPhone,
          checkInAt,
          checkOutAt,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || 'No se pudo registrar el check-in.');
        setShowConfirm(false);
        return;
      }

      setSuccess('Check-in registrado correctamente. Redirigiendo...');
      setTimeout(() => router.push('/rooms'), 1200);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Registrar check-in</h1>
          <p className="mt-2 text-sm text-slate-400">Registra una llegada y reserva la habitación para un huésped.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Habitación disponible</span>
                <select
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  disabled={Boolean(queryRoomId)}
                  required
                >
                  <option value="">Selecciona una habitación</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.number} — {room.type} — ${room.price_per_night}/noche
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Fecha de check-in</span>
                <input
                  type="date"
                  value={checkInAt}
                  onChange={(event) => setCheckInAt(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Fecha de check-out</span>
                <input
                  type="date"
                  value={checkOutAt}
                  onChange={(event) => setCheckOutAt(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </label>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-slate-200">
                <p className="text-sm text-slate-400">Estimación</p>
                <p className="mt-2 text-lg font-semibold text-white">{nights} noche(s)</p>
                <p className="mt-1 text-sm text-slate-300">
                  Total estimado: <span className="font-semibold text-white">${selectedRoom ? total : 0}</span>
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm text-slate-300">Nombre del huésped</span>
                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Juan Pérez"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Identificación</span>
                <input
                  value={guestIdentification}
                  onChange={(event) => setGuestIdentification(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Cédula / Pasaporte"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Teléfono</span>
                <input
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="+57 300 000 0000"
                  required
                />
              </label>
            </div>

            {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Preparar check-in
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

        {showConfirm && selectedRoom ? (
          <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-white">Confirmar check-in</h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <p>
                <span className="font-semibold text-slate-100">Habitación:</span> {selectedRoom.number} — {selectedRoom.type}
              </p>
              <p>
                <span className="font-semibold text-slate-100">Huésped:</span> {guestName}
              </p>
              <p>
                <span className="font-semibold text-slate-100">Check-in:</span> {checkInAt}
              </p>
              <p>
                <span className="font-semibold text-slate-100">Check-out:</span> {checkOutAt}
              </p>
              <p>
                <span className="font-semibold text-slate-100">Noches:</span> {nights}
              </p>
              <p className="text-lg font-semibold text-white">Total estimado: ${total}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="inline-flex w-full justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 sm:w-auto"
              >
                Editar datos
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="inline-flex w-full justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {loading ? 'Registrando...' : 'Confirmar check-in'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
