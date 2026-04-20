/**
 * Custom hook for database operations
 * Provides a simple interface for CRUD operations
 */

'use client';

import { useState, useCallback } from 'react';
import { DatabaseRecord, APIResponse } from '@/types/db';

export interface UseDatabase<T extends DatabaseRecord = DatabaseRecord> {
  // Methods
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<APIResponse<T>>;
  read: (id: string) => Promise<APIResponse<T>>;
  update: (id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>) => Promise<APIResponse<T>>;
  delete: (id: string) => Promise<APIResponse>;
  list: () => Promise<APIResponse<T[]>>;
  query: (criteria: Record<string, any>) => Promise<APIResponse<T[]>>;

  // State
  loading: boolean;
  error: string | null;
}

/**
 * Hook for database operations
 * @param collection - The collection name
 * @returns Database operations and state
 */
export function useDatabase<T extends DatabaseRecord = DatabaseRecord>(
  collection: string
): UseDatabase<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'create',
            collection,
            record: data,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to create record');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );

  const read = useCallback(
    async (id: string): Promise<APIResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/db?collection=${collection}&id=${id}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to read record');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );

  const update = useCallback(
    async (
      id: string,
      data: Partial<Omit<T, 'id' | 'createdAt'>>
    ): Promise<APIResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'update',
            collection,
            id,
            record: data,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to update record');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );

  const deleteRecord = useCallback(
    async (id: string): Promise<APIResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'delete',
            collection,
            id,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to delete record');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );

  const list = useCallback(async (): Promise<APIResponse<T[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/db?collection=${collection}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to list records');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, [collection]);

  const query = useCallback(
    async (criteria: Record<string, any>): Promise<APIResponse<T[]>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'query',
            collection,
            query: criteria,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to query records');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage, data: [] };
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );

  return {
    create,
    read,
    update,
    delete: deleteRecord,
    list,
    query,
    loading,
    error,
  };
}
