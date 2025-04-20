// src/components/frequent-task/frequent-task-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type FrequentTaskFormProps = {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    priority?: string;
    tags?: string[];
  };
  organizations: {
    id: string;
    name: string;
  }[];
  preSelectedOrgId?: string;
  mode: 'create' | 'edit';
};

export default function FrequentTaskForm({ 
  initialData, 
  organizations,
  preSelectedOrgId,
  mode 
}: FrequentTaskFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || '',
    tags: initialData?.tags?.join(', ') || '',
    organization_id: preSelectedOrgId || initialData?.id || (organizations[0]?.id || ''),
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Check if user is the creator of the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('created_by')
        .eq('id', formData.organization_id)
        .single();
      
      if (orgError) throw orgError;
      if (org.created_by !== userData.user.id) {
        throw new Error('Only the organization creator can manage frequent tasks');
      }
      
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        organization_id: formData.organization_id,
        created_by: userData.user.id,
      };
      
      if (mode === 'create') {
        const { error: createError } = await supabase
          .from('frequent_tasks')
          .insert(taskData);
        
        if (createError) throw createError;
      } else if (mode === 'edit' && initialData?.id) {
        const { error: updateError } = await supabase
          .from('frequent_tasks')
          .update(taskData)
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
      }
      
      router.push(`/organizations/${formData.organization_id}`);
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        >
          <option value="">-- Select Priority --</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={formData.tags}
          onChange={handleChange}
          placeholder="work, project, meeting"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700 mb-1">
          Organization *
        </label>
        <select
          id="organization_id"
          name="organization_id"
          value={formData.organization_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading || !!preSelectedOrgId}
        >
          <option value="">-- Select Organization --</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading 
            ? 'Saving...' 
            : mode === 'create' 
              ? 'Create Template' 
              : 'Update Template'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}