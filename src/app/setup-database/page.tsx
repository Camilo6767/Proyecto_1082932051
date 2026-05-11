'use client';

import { useState } from 'react';

interface TableInfo {
  [key: string]: number;
}

interface ConnectionStatus {
  connected: boolean;
  tables?: TableInfo;
  error?: string;
}

interface CreateTableResult {
  step: number;
  table: string;
  status: 'loading' | 'success' | 'error';
  message?: string;
}

export default function SetupDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [createTableResults, setCreateTableResults] = useState<CreateTableResult[]>([]);
  const [createTableLoading, setCreateTableLoading] = useState(false);

  const testConnection = async () => {
    setConnectionLoading(true);
    try {
      const response = await fetch('/api/setup-database', { method: 'GET' });
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setConnectionLoading(false);
    }
  };

  const createTables = async () => {
    setCreateTableLoading(true);
    setCreateTableResults([]);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-all' }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const result = JSON.parse(line.slice(6));
              setCreateTableResults((prev) => [...prev, result]);
            } catch (e) {
              // Ignorar líneas inválidas
            }
          }
        }
      }
    } catch (error) {
      setCreateTableResults((prev) => [
        ...prev,
        {
          step: -1,
          table: 'Error',
          status: 'error',
          message: error instanceof Error ? error.message : 'Error desconocido',
        },
      ]);
    } finally {
      setCreateTableLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Setup Base de Datos — Supabase</h1>

      {/* Sección 1: Test de Conexión */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Test de Conexión</h2>
        <button
          onClick={testConnection}
          disabled={connectionLoading}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: connectionLoading ? 'not-allowed' : 'pointer',
            opacity: connectionLoading ? 0.6 : 1,
          }}
        >
          {connectionLoading ? '⏳ Probando...' : '🔌 Probar Conexión'}
        </button>

        {connectionStatus && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '4px',
              backgroundColor: connectionStatus.connected ? '#dcfce7' : '#fee2e2',
              border: `2px solid ${connectionStatus.connected ? '#22c55e' : '#ef4444'}`,
            }}
          >
            <p>
              <strong>Estado:</strong>{' '}
              {connectionStatus.connected ? (
                <span style={{ color: '#16a34a' }}>✅ Conectado</span>
              ) : (
                <span style={{ color: '#dc2626' }}>❌ Error</span>
              )}
            </p>

            {connectionStatus.error && (
              <p style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {connectionStatus.error}
              </p>
            )}

            {connectionStatus.tables && (
              <div>
                <p>
                  <strong>Tablas:</strong>
                </p>
                <ul style={{ marginLeft: '1rem' }}>
                  {Object.entries(connectionStatus.tables).map(([table, count]) => (
                    <li key={table}>
                      <code>{table}</code> — {count} filas
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección 2: Crear Tablas */}
      <section>
        <h2>Crear Tablas</h2>
        <button
          onClick={createTables}
          disabled={createTableLoading}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: createTableLoading ? 'not-allowed' : 'pointer',
            opacity: createTableLoading ? 0.6 : 1,
          }}
        >
          {createTableLoading ? '⏳ Creando...' : '🔨 Crear Todas las Tablas'}
        </button>

        {createTableResults.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {createTableResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  backgroundColor:
                    result.status === 'success'
                      ? '#dcfce7'
                      : result.status === 'error'
                        ? '#fee2e2'
                        : '#fef3c7',
                  border: `1px solid ${result.status === 'success' ? '#22c55e' : result.status === 'error' ? '#ef4444' : '#f59e0b'}`,
                }}
              >
                <p>
                  <strong>
                    {result.status === 'success'
                      ? '✅'
                      : result.status === 'error'
                        ? '❌'
                        : '⏳'}
                  </strong>{' '}
                  <code>{result.table}</code>
                </p>
                {result.message && (
                  <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {result.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
