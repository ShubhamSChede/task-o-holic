// src/components/organization/organization-tasks.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TodoItem from '@/components/todo/todo-item';
import Link from 'next/link';
import Loader from '@/components/Loader';
import type { Todo } from '@/types/supabase';

type TodoWithProfile = Todo & {
  profiles?: {
    full_name: string | null;
  } | null;
};

type OrganizationTasksProps = {
  organizationId: string;
  userId: string;
  initialTodos: TodoWithProfile[];
};

function OrganizationTasksContent({ 
  organizationId, 
  userId,
  initialTodos 
}: OrganizationTasksProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [todos, setTodos] = useState<TodoWithProfile[]>(initialTodos);
  const [uniqueTags, setUniqueTags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Get filter parameters from URL
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const tag = searchParams.get('tag') || '';
  
  useEffect(() => {
    // Extract unique tags from initial todos
    const tags = new Set<string>();
    initialTodos.forEach(todo => {
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    setUniqueTags(tags);
  }, [initialTodos]);
  
  useEffect(() => {
    const fetchFilteredTodos = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('todos')
          .select('*, profiles(full_name)')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });
        
        // Apply filters
        if (status === 'complete') {
          query = query.eq('is_complete', true);
        } else if (status === 'incomplete') {
          query = query.eq('is_complete', false);
        }
        
        if (priority) {
          query = query.eq('priority', priority);
        }
        
        if (tag) {
          query = query.contains('tags', [tag]);
        }
        
        const { data: todosData, error: todosError } = await query;
        
        if (todosError) {
          console.error('Error fetching filtered todos:', todosError);
          return;
        }
        
        const typedTodos = (todosData || []) as unknown as TodoWithProfile[];
        setTodos(typedTodos);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if filters are applied
    if (status || priority || tag) {
      fetchFilteredTodos();
    } else {
      setTodos(initialTodos);
    }
  }, [status, priority, tag, organizationId, supabase, initialTodos]);
  
  const applyFilter = (paramName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  return (
    <div className="flex flex-col w-full rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
        <h2 className="text-base font-medium text-slate-50 sm:text-lg">Organization tasks</h2>
        <Link
          href={`/todo/create?org=${organizationId}`}
          className="text-xs font-medium text-cyan-300 hover:text-cyan-200 sm:text-sm"
        >
          Add Task
        </Link>
      </div>
      
      {/* Filters */}
      <div className="border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0 bg-slate-900/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-slate-300 tracking-[0.14em] uppercase mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => applyFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-md text-sm bg-slate-900 text-slate-50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          
          <div>
            <label
              htmlFor="priority-filter"
              className="block text-xs font-medium text-slate-300 tracking-[0.14em] uppercase mb-1"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priority}
              onChange={(e) => applyFilter('priority', e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-md text-sm bg-slate-900 text-slate-50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {uniqueTags.size > 0 && (
            <div>
              <label
                htmlFor="tag-filter"
                className="block text-xs font-medium text-slate-300 tracking-[0.14em] uppercase mb-1"
              >
                Tag
              </label>
              <select
                id="tag-filter"
                value={tag}
                onChange={(e) => applyFilter('tag', e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-md text-sm bg-slate-900 text-slate-50 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {Array.from(uniqueTags).map((tagOption) => (
                  <option key={tagOption} value={tagOption}>
                    {tagOption}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Applied Filters Display */}
        {(status || priority || tag) && (
          <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">Applied filters:</span>
            {status && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                Status: {status}
                <button 
                  className="ml-1.5 text-slate-400 hover:text-slate-200" 
                  onClick={() => applyFilter('status', '')}
                >
                  ×
                </button>
              </span>
            )}
            {priority && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                Priority: {priority}
                <button 
                  className="ml-1.5 text-slate-400 hover:text-slate-200" 
                  onClick={() => applyFilter('priority', '')}
                >
                  ×
                </button>
              </span>
            )}
            {tag && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                Tag: {tag}
                <button 
                  className="ml-1.5 text-slate-400 hover:text-slate-200" 
                  onClick={() => applyFilter('tag', '')}
                >
                  ×
                </button>
              </span>
            )}
            <button 
              className="text-xs text-cyan-300 hover:text-cyan-200 underline ml-auto" 
              onClick={() => router.push(window.location.pathname, { scroll: false })}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : todos && todos.length > 0 ? (
          <div className="grid gap-3 p-3 sm:grid-cols-1 sm:gap-4 sm:p-4">
            {todos.map((todo: TodoWithProfile) => (
              <div key={todo.id} className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 sm:p-4">
                <TodoItem
                  todo={todo}
                  userId={userId}
                />
                <div className="mt-2 text-xs text-slate-400 sm:mt-3">
                  Created by: {todo.created_by === userId ? 'You' : todo.profiles?.full_name || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4 text-center text-sm text-slate-400 sm:px-6">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizationTasks(props: OrganizationTasksProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col w-full rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      </div>
    }>
      <OrganizationTasksContent {...props} />
    </Suspense>
  );
}
