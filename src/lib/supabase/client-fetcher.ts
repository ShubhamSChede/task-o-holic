"use client";

import { createClient as createClientOriginal } from '@/lib/supabase/client';

// A version of createClient that can be used in client components that need to fetch data
export async function fetchFromSupabase() {
  const supabase = createClientOriginal();

  return {
    async getTodos(userId: string, filters: { 
      status?: string; 
      priority?: string; 
      tag?: string;
    } = {}) {
      let query = supabase
        .from('todos')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.status === 'complete') {
        query = query.eq('is_complete', true);
      } else if (filters.status === 'incomplete') {
        query = query.eq('is_complete', false);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      
      return await query;
    },

    async getSession() {
      return await supabase.auth.getSession();
    }
  };
}