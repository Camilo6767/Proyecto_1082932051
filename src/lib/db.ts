/**
 * JSON Database utilities using Vercel Blob
 * Provides CRUD operations for JSON data stored in Vercel Blob
 */

import { put, get, del } from '@vercel/blob';
import { DatabaseRecord, DatabaseCollection } from '@/types/db';
import { v4 as uuidv4 } from 'uuid';

const BLOB_PREFIX = 'db';

/**
 * Get the blob path for a collection
 */
function getBlobPath(collection: string): string {
  return `${BLOB_PREFIX}/${collection}.json`;
}

/**
 * Read all records from a collection
 */
export async function readCollection<T extends DatabaseRecord = DatabaseRecord>(
  collection: string
): Promise<T[]> {
  try {
    const path = getBlobPath(collection);
    const blob = await get(path, { access: 'private', useCache: false });

    if (!blob) {
      return [];
    }

    const text = await new Response(blob.stream).text();
    return JSON.parse(text) as T[];
  } catch (error) {
    console.error(`Error reading collection ${collection}:`, error);
    return [];
  }
}

/**
 * Write all records to a collection
 */
export async function writeCollection<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  records: T[]
): Promise<void> {
  try {
    const path = getBlobPath(collection);
    const jsonContent = JSON.stringify(records, null, 2);

    await put(path, jsonContent, {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error(`Error writing collection ${collection}:`, error);
    throw error;
  }
}

/**
 * Create a new record in a collection
 */
export async function createRecord<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
  try {
    const records = await readCollection<T>(collection);

    const newRecord: T = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    records.push(newRecord);
    await writeCollection(collection, records);

    return newRecord;
  } catch (error) {
    console.error(`Error creating record in ${collection}:`, error);
    throw error;
  }
}

/**
 * Read a record by ID
 */
export async function readRecord<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  id: string
): Promise<T | null> {
  try {
    const records = await readCollection<T>(collection);
    return records.find((record) => record.id === id) || null;
  } catch (error) {
    console.error(`Error reading record ${id} from ${collection}:`, error);
    return null;
  }
}

/**
 * Update a record by ID
 */
export async function updateRecord<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  id: string,
  updates: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<T | null> {
  try {
    const records = await readCollection<T>(collection);
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      return null;
    }

    records[index] = {
      ...records[index],
      ...updates,
      id: records[index].id,
      createdAt: records[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    await writeCollection(collection, records);
    return records[index];
  } catch (error) {
    console.error(`Error updating record ${id} in ${collection}:`, error);
    throw error;
  }
}

/**
 * Delete a record by ID
 */
export async function deleteRecord(
  collection: string,
  id: string
): Promise<boolean> {
  try {
    const records = await readCollection(collection);
    const filteredRecords = records.filter((record) => record.id !== id);

    if (records.length === filteredRecords.length) {
      return false; // Record not found
    }

    await writeCollection(collection, filteredRecords);
    return true;
  } catch (error) {
    console.error(`Error deleting record ${id} from ${collection}:`, error);
    throw error;
  }
}

/**
 * List all records in a collection with optional filtering
 */
export async function listRecords<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  filter?: (record: T) => boolean
): Promise<T[]> {
  try {
    const records = await readCollection<T>(collection);
    return filter ? records.filter(filter) : records;
  } catch (error) {
    console.error(`Error listing records in ${collection}:`, error);
    return [];
  }
}

/**
 * Query records by matching criteria
 */
export async function queryRecords<T extends DatabaseRecord = DatabaseRecord>(
  collection: string,
  query: Record<string, any>
): Promise<T[]> {
  try {
    const records = await readCollection<T>(collection);

    return records.filter((record) => {
      return Object.entries(query).every(([key, value]) => {
        return record[key] === value;
      });
    });
  } catch (error) {
    console.error(`Error querying records in ${collection}:`, error);
    return [];
  }
}

/**
 * Delete an entire collection
 */
export async function deleteCollection(collection: string): Promise<void> {
  try {
    const path = getBlobPath(collection);
    await del(path, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error(`Error deleting collection ${collection}:`, error);
    throw error;
  }
}

/**
 * Check if a collection exists
 */
export async function collectionExists(collection: string): Promise<boolean> {
  try {
    const path = getBlobPath(collection);
    const blob = await get(path, { access: 'private', useCache: false });
    return blob !== null;
  } catch (error) {
    return false;
  }
}
