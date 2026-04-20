/**
 * Example component demonstrating database usage
 * This is a sample implementation that can be copied and modified
 */

'use client';

import { useState } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { DatabaseRecord } from '@/types/db';

interface ExampleRecord extends DatabaseRecord {
  title: string;
  description: string;
  completed?: boolean;
}

export default function ExampleDatabaseComponent() {
  const db = useDatabase<ExampleRecord>('examples');
  const [records, setRecords] = useState<ExampleRecord[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Load all records
  const handleLoadRecords = async () => {
    const response = await db.list();
    if (response.success) {
      setRecords(response.data || []);
    }
  };

  // Create a new record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    const response = await db.create({
      title: formData.title,
      description: formData.description,
      completed: false,
    });

    if (response.success && response.data) {
      setRecords([...records, response.data]);
      setFormData({ title: '', description: '' });
    } else {
      alert(`Error: ${response.error}`);
    }
  };

  // Update a record
  const handleUpdateRecord = async (id: string, updates: Partial<ExampleRecord>) => {
    const response = await db.update(id, updates);

    if (response.success && response.data) {
      setRecords(records.map((r) => (r.id === id ? response.data : r)));
    } else {
      alert(`Error: ${response.error}`);
    }
  };

  // Delete a record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const response = await db.delete(id);

    if (response.success) {
      setRecords(records.filter((r) => r.id !== id));
    } else {
      alert(`Error: ${response.error}`);
    }
  };

  // Search records by title
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      handleLoadRecords();
      return;
    }

    // Filter locally (in production, you might want to implement server-side search)
    const filtered = records.filter((r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setRecords(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Database Example</h1>

        {/* Form to create records */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Record</h2>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
                rows={4}
              />
            </div>
            <button
              type="submit"
              disabled={db.loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {db.loading ? 'Creating...' : 'Create Record'}
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleLoadRecords}
              disabled={db.loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {db.loading ? 'Loading...' : 'Load Records'}
            </button>
            <input
              type="text"
              placeholder="Search by title..."
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
            />
          </div>
          {db.error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{db.error}</div>}
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Records ({records.length})</h2>

          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No records found. Load or create some!</p>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{record.title}</h3>
                      <p className="text-gray-600 mt-2">{record.description}</p>
                      <div className="mt-3 text-sm text-gray-500 space-y-1">
                        <p>ID: {record.id}</p>
                        {record.createdAt && (
                          <p>Created: {new Date(record.createdAt).toLocaleString()}</p>
                        )}
                        {record.updatedAt && (
                          <p>Updated: {new Date(record.updatedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateRecord(record.id, {
                            completed: !record.completed,
                          })
                        }
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${
                          record.completed
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {record.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
