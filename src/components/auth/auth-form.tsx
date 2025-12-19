// src/components/auth/auth-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
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
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        });
        
        if (error) throw error;
        
        setShowVerificationMessage(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      
      const message = error instanceof Error ? error.message : '';

      // Provide more specific error messages
      if (message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (message.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (message.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else if (message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Show verification message after successful signup
  if (showVerificationMessage) {
    return (
      <Card className="border-purple-200 shadow-sm max-w-md w-full mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-purple-800">
            Check Your Email
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Verification Email Sent!
            </h3>
            <p className="text-purple-600 mb-4">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-purple-500 mb-6">
              Please check your email and click the verification link to activate your account.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setShowVerificationMessage(false)}
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Back to Sign Up
            </Button>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 shadow-sm max-w-md w-full mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center text-purple-800">
          {type === 'login' ? 'Sign In' : 'Create an Account'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-50 text-red-500 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-purple-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-purple-200 bg-white text-purple-900 focus-visible:ring-purple-500"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-purple-200 bg-white text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-purple-200 bg-white text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : type === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <div className="text-sm text-purple-500">
          {type === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
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
      </CardFooter>
    </Card>
  );
}

