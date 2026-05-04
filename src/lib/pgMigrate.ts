import { Client } from 'pg';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no configurada.');
  }
  return databaseUrl;
}

export async function getClient(): Promise<Client> {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  return client;
}

export async function ensureMigrationTable(client: Client): Promise<void> {
  await client.query(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );`
  );
}

export async function getAppliedMigrationNames(): Promise<string[]> {
  const client = await getClient();
  try {
    await ensureMigrationTable(client);
    const result = await client.query<{ filename: string }>('SELECT filename FROM _migrations ORDER BY id ASC;');
    return result.rows.map((row) => row.filename);
  } finally {
    await client.end();
  }
}

export async function loadMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith('.sql')).sort();
}

export async function applyPendingMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
  const client = await getClient();
  try {
    await ensureMigrationTable(client);
    const applied = new Set(await getAppliedMigrationNames());
    const files = await loadMigrationFiles();
    const appliedNow: string[] = [];
    const skipped: string[] = [];

    for (const filename of files) {
      if (applied.has(filename)) {
        skipped.push(filename);
        continue;
      }

      const filePath = path.join(process.cwd(), 'supabase', 'migrations', filename);
      const sql = await readFile(filePath, 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations(filename) VALUES($1);', [filename]);
        await client.query('COMMIT');
        appliedNow.push(filename);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    return { applied: appliedNow, skipped };
  } finally {
    await client.end();
  }
}
