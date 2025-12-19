// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { cache } from 'react';

export const createClient = cache(async () => {
  // Use await since cookies() returns a Promise
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(
              name,
              value,
              options as unknown as Parameters<typeof cookieStore.set>[2],
            );
          } catch (error) {
            // Ignore cookie setting errors in server components
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(
              name,
              '',
              {
                ...(options as unknown as Parameters<typeof cookieStore.set>[2]),
                maxAge: 0,
              },
            );
          } catch (error) {
            // Ignore cookie removal errors in server components
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
});