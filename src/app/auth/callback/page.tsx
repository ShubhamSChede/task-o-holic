// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/Loader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for auth tokens in URL
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const error = hashParams.get('error') || searchParams.get('error');
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Email verification failed. Please try again.');
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Email verification failed. Please try again.');
            return;
          }

          // Verify the session
          const { data: { session }, error: verifyError } = await supabase.auth.getSession();
          
          if (verifyError || !session) {
            console.error('Session verification error:', verifyError);
            setStatus('error');
            setMessage('Email verification failed. Please try again.');
            return;
          }

          // Success! User is now authenticated
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // No tokens found, check if user is already authenticated
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            setStatus('error');
            setMessage('Email verification failed. Please try again.');
            return;
          }

          // User is already authenticated
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
          <CardContent className="p-8 text-center">
            <Loader />
            <h2 className="mt-4 text-xl font-semibold text-slate-50">
              Verifying your email…
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Please wait while we verify your email address.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-50">
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              status === 'success' ? 'bg-emerald-400/15 border border-emerald-400/40' : 'bg-red-500/15 border border-red-500/40'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-8 h-8 text-emerald-300" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
            
            <p className={`text-lg font-medium ${
              status === 'success' ? 'text-emerald-200' : 'text-red-300'
            }`}>
              {message}
            </p>
            
            {status === 'success' && (
              <p className="mt-2 text-sm text-slate-400">
                You will be automatically redirected to your dashboard.
              </p>
            )}
          </div>
          
          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                Go to Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
                variant="outline"
                className="w-full border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                Try Signing Up Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-purple-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader />
            <h2 className="text-xl font-semibold text-purple-800 mt-4">
              Loading...
            </h2>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
