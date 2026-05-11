import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

let _client: SupabaseClient | null = null;
let _checked = false;

/**
 * Build-safe: retorna null si no hay env vars (sin lanzar error)
 * Ideal para páginas estáticas y componentes del cliente
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null; // Ya verificamos, no hay config

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  _checked = true;

  if (!url || !key) {
    console.warn('[supabase] No configurado — retornando null (build-safe)');
    return null;
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}

/**
 * Requiere que Supabase esté configurado (lanza error si no)
 * Usar solo en route handlers protegidos
 */
export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase no configurado. Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return client;
}

/**
 * Ejecuta queries DDL (CREATE TABLE, ALTER, etc.) contra PostgreSQL directamente
 * PostgREST no puede hacer DDL, por eso usamos postgres.js
 */
export async function executeSql(query: string): Promise<void> {
  const connString = process.env.DATABASE_URL;

  if (!connString) {
    throw new Error('DATABASE_URL no configurado (necesario para DDL)');
  }

  const sql = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });

  try {
    await sql.unsafe(query);
  } finally {
    await sql.end();
  }
}
