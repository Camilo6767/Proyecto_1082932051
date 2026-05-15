'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/db-setup', {
        method: 'POST',
      });

      const text = await response.text();
      let result: { success?: boolean; message?: string } = {};

      try {
        result = text ? JSON.parse(text) : { success: false, message: 'Respuesta vacía del servidor' };
      } catch {
        result = { success: false, message: text || `Respuesta no válida (${response.status})` };
      }

      if (response.ok) {
        setMessage(result.message ?? 'Setup completado.');
      } else {
        setError(result.message ?? 'Error desconocido del servidor.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '48px 16px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '520px',
          borderRadius: '32px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.35)',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
          ⚙️ Setup Base de Datos
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.7 }}>
          Esta página insertará el seed inicial en la base de datos local (JSON). <strong>No requiere conexión a Supabase.</strong>
        </p>

        <button
          onClick={handleSetup}
          disabled={loading}
          style={{
            backgroundColor: '#1d4ed8',
            color: '#f8fafc',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Cargando...' : 'Iniciar Setup'}
        </button>
        {message && <p style={{ color: '#22c55e' }}>{message}</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      </div>
    </main>
  );
}
