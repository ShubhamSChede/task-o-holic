// src/components/organization/org-join-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OrgJoinForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Find organization by name and password
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, password')
        .eq('name', formData.name)
        .single();
      
      if (orgError) {
        if (orgError.code === 'PGRST116') {
          throw new Error('Organization not found');
        }
        throw orgError;
      }
      
      // Verify password
      if (org.password !== formData.password) {
        throw new Error('Incorrect password');
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', org.id)
        .eq('user_id', userData.user.id)
        .single();
      
      if (existingMember) {
        throw new Error('You are already a member of this organization');
      }
      
      // Add user as a member
      const { error: joinError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userData.user.id,
          role: 'member',
        });
      
      if (joinError) throw joinError;
      
      router.push(`/organizations/${org.id}`);
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
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Organization'}
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