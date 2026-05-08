/**
 * API routes for JSON Database CRUD operations
 * Endpoint: /api/db
 * Methods: POST (with operation type)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createRecord,
  readRecord,
  updateRecord,
  deleteRecord,
  listRecords,
  queryRecords,
  collectionExists,
} from '@/lib/db';
import { APIResponse, CRUDOperation } from '@/types/db';

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const body = (await request.json()) as CRUDOperation;
    const { operation, collection, record, id, query } = body;

    // Validate required fields
    if (!operation || !collection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: operation, collection',
        },
        { status: 400 }
      );
    }

    switch (operation) {
      case 'create':
        if (!record) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: record' },
            { status: 400 }
          );
        }
        const created = await createRecord(collection, record);
        return NextResponse.json({
          success: true,
          data: created,
          message: 'Record created successfully',
        });

      case 'read':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: id' },
            { status: 400 }
          );
        }
        const read = await readRecord(collection, id);
        if (!read) {
          return NextResponse.json(
            { success: false, error: 'Record not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: read,
        });

      case 'update':
        if (!id || !record) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: id, record' },
            { status: 400 }
          );
        }
        const updated = await updateRecord(collection, id, record);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: 'Record not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Record updated successfully',
        });

      case 'delete':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: id' },
            { status: 400 }
          );
        }
        const deleted = await deleteRecord(collection, id);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Record not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Record deleted successfully',
        });

      case 'list':
        const list = await listRecords(collection);
        return NextResponse.json({
          success: true,
          data: list,
        });

      case 'query':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: query' },
            { status: 400 }
          );
        }
        const results = await queryRecords(collection, query);
        return NextResponse.json({
          success: true,
          data: results,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const id = searchParams.get('id');

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: collection' },
        { status: 400 }
      );
    }

    // Check if collection exists first
    const exists = await collectionExists(collection);

    if (id) {
      // Get single record
      const record = await readRecord(collection, id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: record,
      });
    } else {
      // List all records
      const records = await listRecords(collection);
      return NextResponse.json({
        success: true,
        data: records,
      });
    }
  } catch (error) {
    console.error('Database GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
