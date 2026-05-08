'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateTotal } from '@/lib/bookingService';
import { type BookingWithGuest } from '@/lib/types';

export default function CheckoutBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingWithGuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setError('ID de reserva no válido.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/login');
          return;
        }

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          setError(result?.error || 'No se pudo cargar la reserva.');
          return;
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch {
        setError('Error de conexión al cargar la reserva.');
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId, router]);

  const handleCheckout = async () => {
    if (!booking) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/checkout/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || 'No se pudo completar el check-out.');
        return;
      }

      router.push('/rooms');
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">Cargando detalles del check-out...</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Error</h1>
          <p className="mt-2 text-sm text-slate-400">{error || 'Reserva no encontrada.'}</p>
          <button
            type="button"
            onClick={() => router.push('/checkout')}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Volver a check-outs
          </button>
        </div>
      </main>
    );
  }

  const total = calculateTotal(booking.price_per_night, booking.nights);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Confirmar check-out</h1>
          <p className="mt-2 text-sm text-slate-400">Revisa los detalles y confirma el cobro.</p>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl bg-slate-950/60 p-6">
              <h2 className="text-lg font-semibold text-white">Datos del huésped</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p><span className="font-medium text-slate-100">Nombre:</span> {booking.guest_name}</p>
                <p><span className="font-medium text-slate-100">Identificación:</span> {booking.guest_identification}</p>
                <p><span className="font-medium text-slate-100">Teléfono:</span> {booking.guest_phone}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950/60 p-6">
              <h2 className="text-lg font-semibold text-white">Detalles de la estadía</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p><span className="font-medium text-slate-100">Check-in:</span> {booking.check_in_at}</p>
                <p><span className="font-medium text-slate-100">Check-out esperado:</span> {booking.checkout_at}</p>
                <p><span className="font-medium text-slate-100">Noches:</span> {booking.nights}</p>
                <p><span className="font-medium text-slate-100">Precio por noche:</span> ${booking.price_per_night}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-emerald-950/60 border border-emerald-500/20 p-6">
              <h2 className="text-lg font-semibold text-emerald-100">Total a cobrar</h2>
              <p className="mt-2 text-4xl font-bold text-emerald-200">${total}</p>
            </div>
          </div>

          {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="inline-flex w-full justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={handleCheckout}
              className="inline-flex w-full justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {processing ? 'Procesando...' : 'Confirmar check-out y cobro'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
