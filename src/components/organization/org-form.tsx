// src/components/organization/org-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type OrgFormProps = {
  mode: 'create';
} | {
  mode: 'edit';
  initialData: {
    id: string;
    name: string;
    description?: string;
    password: string;
  };
};

export default function OrgForm(props: OrgFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const initialData = props.mode === 'edit' ? props.initialData : null;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    password: initialData?.password || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      const orgData = {
        name: formData.name,
        description: formData.description || null,
        password: formData.password,
        created_by: userData.user.id,
      };
      
      if (props.mode === 'create') {
        // Create organization
        const { data: org, error: createError } = await supabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single();
        
        if (createError) throw createError;
        if (!org) throw new Error('Failed to create organization');
        
        // Add creator as a member with admin role
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: userData.user.id,
            role: 'admin',
          });
        
        if (memberError) throw memberError;
        
        router.push(`/organizations/${org.id}`);
      } else if (props.mode === 'edit' && initialData) {
        // Update organization
        const { error: updateError } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
        
        router.push(`/organizations/${initialData.id}`);
      }
      
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
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
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Members will need this password to join the organization.
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading 
            ? 'Saving...' 
            : props.mode === 'create' 
              ? 'Create Organization' 
              : 'Update Organization'}
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