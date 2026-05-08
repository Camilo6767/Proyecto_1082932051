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

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setError(result.message);
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
          Esta página insertará el seed inicial en Supabase. <strong>Las tablas deben ya existir.</strong>
        </p>

        <button
          onClick={handleSetup}
          disabled={loading}
          style={{
            width: '100%',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: loading ? '#64748b' : '#10b981',
            color: '#ffffff',
            padding: '14px 16px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? 'Configurando...' : 'Iniciar Seed'}
        </button>

        {message && (
          <div
            style={{
              marginTop: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#d1fae5',
              padding: '12px 14px',
              fontSize: '0.95rem',
            }}
          >
            ✅ {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(251, 146, 60, 0.15)',
              color: '#fee2e2',
              padding: '12px 14px',
              fontSize: '0.95rem',
            }}
          >
            ❌ {error}
          </div>
        )}
      </div>
    </main>
  );
}
