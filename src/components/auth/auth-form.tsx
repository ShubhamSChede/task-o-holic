// src/components/auth/auth-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type AuthFormProps = {
  type: 'login' | 'register';
};

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (type === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) throw error;
        
        router.push('/login?message=Check your email to confirm your account');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 max-w-md w-full mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-purple-800">
        {type === 'login' ? 'Sign In' : 'Create an Account'}
      </h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'register' && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-purple-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : type === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-purple-500">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

