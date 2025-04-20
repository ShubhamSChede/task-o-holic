// src/components/profile/profile-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ProfileFormProps = {
  initialData: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  userEmail: string;
};

export default function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    avatar_url: initialData.avatar_url || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('id', initialData.id);
      
      if (updateError) throw updateError;
      
      setSuccess('Profile updated successfully');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-purple-200">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md">
          {success}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={userEmail}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-gray-50 text-purple-900"
        />
        <p className="mt-1 text-sm text-purple-500">
          Email cannot be changed
        </p>
      </div>
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-purple-700 mb-1">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-purple-700 mb-1">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="text"
          value={formData.avatar_url}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
}