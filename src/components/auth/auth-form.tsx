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
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
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

