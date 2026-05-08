/**
 * Type definitions for JSON Database with Vercel Blob
 */

export interface DatabaseRecord {
  id: string;
  [key: string]: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatabaseCollection<T extends DatabaseRecord = DatabaseRecord> {
  name: string;
  records: T[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CRUDOperation {
  operation: 'create' | 'read' | 'update' | 'delete' | 'list' | 'query';
  collection: string;
  record?: DatabaseRecord;
  id?: string;
  query?: Record<string, any>;
}
