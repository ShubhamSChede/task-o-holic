// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { cache } from 'react';

export const createClient = cache(() => {
  // Using the modern Next.js cookies API which should be synchronous
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Directly set the cookie with name/value format instead of object
          cookieStore.set(name, value, options as any);
        },
        remove(name: string, options: CookieOptions) {
          // Empty value and maxAge=0 effectively removes the cookie
          cookieStore.set(name, '', { ...options as any, maxAge: 0 });
        },
      },
    }
  );
});