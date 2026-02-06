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
      <Card className="max-w-md w-full mx-auto border-slate-800/80 bg-slate-950/80 shadow-[0_24px_70px_rgba(15,23,42,0.95)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-semibold text-center text-slate-50">
            Check Your Email
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-400/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-400/40">
              <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              Verification Email Sent!
            </h3>
            <p className="text-slate-300 mb-4 text-sm">
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Please check your email and click the verification link to activate your account.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setShowVerificationMessage(false)}
              variant="outline"
              className="w-full border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900"
            >
              Back to Sign Up
            </Button>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950"
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full mx-auto border-slate-800/80 bg-slate-950/80 shadow-[0_24px_70px_rgba(15,23,42,0.95)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-semibold text-center text-slate-50">
          {type === 'login' ? 'Welcome back' : 'Create your space'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950/60 text-red-300 border-red-500/40">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-200 text-xs uppercase tracking-[0.16em]">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 text-xs uppercase tracking-[0.16em]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 text-xs uppercase tracking-[0.16em]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold"
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
        <div className="text-xs text-slate-400">
          {type === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-cyan-300 hover:text-cyan-200 font-medium">
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-300 hover:text-cyan-200 font-medium">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

