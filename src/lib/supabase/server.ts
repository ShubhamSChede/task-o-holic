// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { cache } from 'react';

import { serialize } from 'cookie';

export const createClient = cache(() => {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) {
            // We can't use cookies.set in a Server Component
            // so we need to handle this case
          }
        },
        async remove(name: string, options: any) {
          try {
            (await cookieStore).set({ name, value: '', ...options });
          } catch (error) {
            // We can't use cookies.set in a Server Component
            // so we need to handle this case
          }
        }
      }
    }
  );
});



