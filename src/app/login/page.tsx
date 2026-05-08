'use client';

import { type CSSProperties, type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#020617',
    color: '#f8fafc',
    padding: '48px 16px',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    margin: '0 auto',
    maxWidth: '520px',
    borderRadius: '32px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.35)',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#ffffff',
  },
  description: {
    color: '#94a3b8',
    lineHeight: 1.7,
    marginBottom: '28px',
  },
  form: {
    display: 'grid',
    gap: '20px',
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    marginTop: '10px',
    borderRadius: '20px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '14px 16px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    width: '100%',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#0ea5e9',
    color: '#0f172a',
    padding: '14px 16px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  error: {
    borderRadius: '20px',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    color: '#fee2e2',
    padding: '12px 14px',
    fontSize: '0.95rem',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result?.message || 'No se pudo iniciar sesión.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.heading}>HostDesk</h1>
        <p style={styles.description}>Inicia sesión para acceder al dashboard de administración y recepcionista.</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
              required
            />
          </label>

          {error ? <p style={styles.error}>{error}</p> : null}

          <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}
