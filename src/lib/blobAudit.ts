import { get, put } from '@vercel/blob';
import { AuditEntry } from './types';

const lockMap = new Map<string, Promise<void>>();

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no configurado.');
  }
  return token;
}

function getAuditPath(yyyymm: string): string {
  return `audit/${yyyymm}.json`;
}

async function withFileLock<T>(path: string, callback: () => Promise<T>): Promise<T> {
  const previousLock = lockMap.get(path) ?? Promise.resolve();
  let release: () => void = () => undefined;
  const nextLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  lockMap.set(path, previousLock.then(() => nextLock));

  try {
    await previousLock;
    return await callback();
  } finally {
    release();
    const currentLock = lockMap.get(path);
    if (currentLock && currentLock === previousLock.then(() => nextLock)) {
      lockMap.delete(path);
    }
  }
}

export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  const path = getAuditPath(yyyymm);
  const token = getBlobToken();
  const result = await get(path, { token, access: 'private', useCache: false });

  if (!result) {
    return [];
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as AuditEntry[];
}

export async function appendAudit(entry: AuditEntry): Promise<void> {
  const yyyymm = entry.timestamp.slice(0, 7).replace('-', '');
  const path = getAuditPath(yyyymm);
  const token = getBlobToken();

  await withFileLock(path, async () => {
    const result = await get(path, { token, access: 'private', useCache: false });
    const existing = result ? (JSON.parse(await new Response(result.stream).text()) as AuditEntry[]) : [];
    existing.push(entry);
    const payload = JSON.stringify(existing, null, 2);
    await put(path, payload, {
      token,
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  });
}
