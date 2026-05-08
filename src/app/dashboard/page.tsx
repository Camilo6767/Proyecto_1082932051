'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DashboardResponse = {
  mode: 'seed' | 'live';
  role: 'admin' | 'recepcionista';
  totalRooms: number;
  availableCount: number;
  occupiedCount: number;
  todayIncome?: number | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard', { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          const result = await response.json();
          setError(result?.message || 'No se pudo cargar el dashboard.');
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Error de conexión al obtener datos del dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">Cargando panel...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const occupancyRate = data.totalRooms ? Math.round((data.occupiedCount / data.totalRooms) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-sky-400/80">Dashboard</p>
              <h1 className="text-3xl font-semibold text-white">Bienvenido al Panel de HostDesk</h1>
            </div>
            <div className="space-y-2 text-right text-sm text-slate-400">
              <p>Rol: <span className="font-semibold text-white">{data.role}</span></p>
              <p>Modo: <span className="font-semibold text-white">{data.mode === 'seed' ? 'Seed' : 'Live'}</span></p>
            </div>
          </div>
        </section>

        {data.mode === 'seed' ? (
          <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 text-amber-100 shadow-inner shadow-amber-900/20">
            <h2 className="text-xl font-semibold text-amber-100">El sistema está en modo seed</h2>
            <p className="mt-2 text-sm text-amber-200/90">
              Actualmente se usa la configuración inicial de datos. Ejecuta el bootstrap desde el panel de administración para cambiar a modo live.
            </p>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Total de habitaciones</p>
            <p className="mt-5 text-5xl font-semibold text-white">{data.totalRooms}</p>
          </article>
          <article className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Disponibles</p>
            <p className="mt-5 text-5xl font-semibold text-emerald-400">{data.availableCount}</p>
          </article>
          <article className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Ocupadas</p>
            <p className="mt-5 text-5xl font-semibold text-rose-400">{data.occupiedCount}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Tasa de ocupación</h2>
              <p className="mt-2 text-sm text-slate-400">Porcentaje de habitaciones ocupadas en el inventario.</p>
            </div>
            <div className="rounded-full bg-slate-800 px-4 py-3 text-lg font-semibold text-white">{occupancyRate}%</div>
          </div>
        </section>

        {data.role === 'admin' ? (
          <section className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <h2 className="text-xl font-semibold text-white">Información administrativa</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Ingresos del día</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {typeof data.todayIncome === 'number' ? `S/ ${data.todayIncome.toFixed(2)}` : 'No disponible'}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Acciones</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="/admin/db-setup"
                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Ir a DB Setup
                  </a>
                  <a
                    href="/rooms"
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                  >
                    Ver habitaciones
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
