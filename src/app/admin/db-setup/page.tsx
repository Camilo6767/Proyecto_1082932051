'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DiagnoseResult = {
  mode: 'seed' | 'live';
  diagnostics?: Record<string, unknown>;
  seed?: boolean;
};

export default function DbSetupPage() {
  const router = useRouter();
  const [diagnose, setDiagnose] = useState<DiagnoseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiagnose() {
      try {
        const response = await fetch('/api/system/diagnose', { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          const result = await response.json();
          setError(result?.message || 'No se pudo obtener el diagnóstico.');
          return;
        }

        const result = await response.json();
        setDiagnose(result);
      } catch {
        setError('Error de conexión al cargar el diagnóstico.');
      } finally {
        setLoading(false);
      }
    }

    loadDiagnose();
  }, [router]);

  const handleBootstrap = async () => {
    setBootstrapMessage(null);
    setError(null);
    setBootstrapLoading(true);

    try {
      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bootstrap-secret': secret,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result?.message || 'No se pudo ejecutar el bootstrap.');
        return;
      }

      const result = await response.json();
      setBootstrapMessage(result?.message || 'Bootstrap completado.');
      setDiagnose((current) => ({ ...current, mode: 'live', seed: false } as DiagnoseResult));
    } catch {
      setError('Error de conexión al ejecutar el bootstrap.');
    } finally {
      setBootstrapLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
          <p className="text-sm text-slate-400">Cargando diagnóstico de infraestructura...</p>
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
              <p className="text-sm uppercase tracking-[0.18em] text-sky-400/80">Administración</p>
              <h1 className="text-3xl font-semibold text-white">Diagnóstico y bootstrap</h1>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>Estado actual: <span className="font-semibold text-white">{diagnose?.mode === 'seed' ? 'Seed' : 'Live'}</span></p>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">
            <p>{error}</p>
          </section>
        ) : null}

        {bootstrapMessage ? (
          <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-100">
            <p>{bootstrapMessage}</p>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <h2 className="text-xl font-semibold text-white">Estado del diagnóstico</h2>
            <p className="mt-3 text-sm text-slate-400">Revisa si Supabase y Vercel Blob están disponibles, junto con los archivos de migración.</p>
            <pre className="mt-6 overflow-x-auto rounded-3xl bg-slate-950/90 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(diagnose?.diagnostics ?? { mode: diagnose?.mode }, null, 2)}
            </pre>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900/95 p-6">
            <h2 className="text-xl font-semibold text-white">Ejecutar bootstrap</h2>
            <p className="mt-3 text-sm text-slate-400">Introduce el secreto de bootstrap y ejecuta la configuración inicial contra Supabase y Blob.</p>
            <label className="mt-6 block text-sm text-slate-300">
              <span>Secreto de bootstrap</span>
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                placeholder="Ingresa el valor de x-bootstrap-secret"
              />
            </label>
            <button
              type="button"
              disabled={!secret || bootstrapLoading}
              onClick={handleBootstrap}
              className="mt-6 inline-flex w-full justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {bootstrapLoading ? 'Ejecutando bootstrap...' : 'Ejecutar bootstrap'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
