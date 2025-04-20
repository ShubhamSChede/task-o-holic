// src/components/todo/todo-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type TodoFormProps = {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    due_date?: string;
    priority?: string;
    tags?: string[];
    organization_id?: string;
    is_complete?: boolean;
  };
  organizations: {
    id: string;
    name: string;
  }[];
  mode: 'create' | 'edit';
};

export default function TodoForm({ initialData, organizations, mode }: TodoFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
    priority: initialData?.priority || '',
    tags: initialData?.tags?.join(', ') || '',
    organization_id: initialData?.organization_id || '',
    is_complete: initialData?.is_complete || false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const todoData = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        priority: formData.priority || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        organization_id: formData.organization_id || null,
        is_complete: formData.is_complete,
        created_by: userData.user.id,
      };

      if (mode === 'create') {
        const { error: createError } = await supabase.from('todos').insert(todoData);
        if (createError) throw createError;
      } else if (mode === 'edit' && initialData?.id) {
        const { error: updateError } = await supabase
          .from('todos')
          .update(todoData)
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      }

      router.push('/todo');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-purple-700 mb-2">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-purple-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-purple-700 mb-2">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-purple-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- Select Priority --</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-purple-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={formData.tags}
          onChange={handleChange}
          placeholder="work, personal, project"
          className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="organization_id" className="block text-sm font-medium text-purple-700 mb-2">
          Organization
        </label>
        <select
          id="organization_id"
          name="organization_id"
          value={formData.organization_id}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="">-- Personal Task --</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_complete"
          name="is_complete"
          type="checkbox"
          checked={formData.is_complete}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-purple-600 rounded border-purple-200 focus:ring-purple-500"
          disabled={loading}
        />
        <label htmlFor="is_complete" className="ml-2 text-sm text-purple-700">
          Mark as complete
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}