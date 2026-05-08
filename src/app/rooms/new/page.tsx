'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRoomPage() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const priceValue = Number(price);
    if (!number || !type || Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Completa todos los campos correctamente.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, type, price_per_night: priceValue }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || 'No se pudo crear la habitación.');
        return;
      }

      setSuccess('Habitación creada correctamente. Redirigiendo...');
      setTimeout(() => router.push('/rooms'), 1000);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Crear nueva habitación</h1>
          <p className="mt-2 text-sm text-slate-400">Registra una habitación para que aparezca en el panel de operaciones.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Número</span>
                <input
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="101"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Tipo</span>
                <input
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Doble"
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
                placeholder="120"
                required
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creando habitación...' : 'Crear habitación'}
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
