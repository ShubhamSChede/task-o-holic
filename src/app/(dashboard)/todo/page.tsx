// src/app/(dashboard)/todos/page.tsx
"use client";

import TodoItem from '@/components/todo/todo-item';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { fetchFromSupabase } from '@/lib/supabase/client-fetcher';
import Loader from '@/components/Loader';
import ErrorDisplay from '@/components/ui/error-display';
import type { Todo } from '@/types/supabase';

// Type for Todo with organizations relation
type TodoWithOrg = Todo & {
  organizations?: {
    name: string;
  } | null;
};

export default function TodosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [todos, setTodos] = useState<TodoWithOrg[]>([]);
  const [uniqueTags, setUniqueTags] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Unwrap searchParams using React.use()
  const params = use(searchParams);
  
  // Get filter parameters
  const status = typeof params.status === 'string' ? params.status : undefined;
  const priority = typeof params.priority === 'string' ? params.priority : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use the client-side fetcher
        const fetcher = await fetchFromSupabase();
        const { data: { session: userSession } } = await fetcher.getSession();

        if (!userSession) {
          setIsLoading(false);
          return;
        }

        setSession(userSession);

        // Execute query
        const { data: todosData, error: todosError } = await fetcher.getTodos(
          userSession.user.id, 
          { status, priority, tag }
        );

        if (todosError) {
          console.error('Error fetching todos:', todosError);
          setError('Error loading tasks. Please try again.');
          setIsLoading(false);
          return;
        }

        // Type assertion: TypeScript doesn't properly infer the type from Supabase query
        const typedTodos = (todosData || []) as unknown as TodoWithOrg[];
        setTodos(typedTodos);

        // Get all unique tags for filter dropdown
        const tags = new Set<string>();
        typedTodos.forEach(todo => {
          if (todo.tags) {
            todo.tags.forEach((tag: string) => tags.add(tag));
          }
        });

        setUniqueTags(tags);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, status, priority, tag]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // The useEffect will automatically retry when isLoading changes
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorDisplay 
          error={error}
          onRetry={handleRetry}
          title="Failed to load tasks"
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const applyFilter = (paramName: string, value: string) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(paramName, value);
    } else {
      url.searchParams.delete(paramName);
    }
    window.location.href = url.toString();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-purple-800">My Tasks</h1>
        <Link 
          href="/todo/create" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors w-full sm:w-auto text-center mt-2"
        >
          Create Task
        </Link>
      </div>
      
      {/* Filters - Improved for small screens */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-purple-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-purple-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              defaultValue={status || ''}
              onChange={(e) => applyFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-purple-700 mb-1">
              Priority
            </label>
            <select
              id="priority-filter"
              defaultValue={priority || ''}
              onChange={(e) => applyFilter('priority', e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {uniqueTags.size > 0 && (
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-purple-700 mb-1">
                Tag
              </label>
              <select
                id="tag-filter"
                defaultValue={tag || ''}
                onChange={(e) => applyFilter('tag', e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {Array.from(uniqueTags).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading Indicator */}
      {isLoading ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-purple-200">
          <Loader />
        </div>
      ) : (
        <>
          {/* Applied Filters Display */}
          {(status || priority || tag) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-purple-700">Applied filters:</span>
              {status && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Status: {status}
                  <button 
                    className="ml-1 text-purple-600 hover:text-purple-900" 
                    onClick={() => applyFilter('status', '')}
                  >
                    ×
                  </button>
                </span>
              )}
              {priority && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Priority: {priority}
                  <button 
                    className="ml-1 text-purple-600 hover:text-purple-900" 
                    onClick={() => applyFilter('priority', '')}
                  >
                    ×
                  </button>
                </span>
              )}
              {tag && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Tag: {tag}
                  <button 
                    className="ml-1 text-purple-600 hover:text-purple-900" 
                    onClick={() => applyFilter('tag', '')}
                  >
                    ×
                  </button>
                </span>
              )}
              <button 
                className="text-xs text-purple-600 hover:text-purple-800 underline ml-auto" 
                onClick={() => window.location.href = window.location.pathname}
              >
                Clear all filters
              </button>
            </div>
          )}
          
          {/* Todos List - Responsive Grid */}
          {todos && todos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  userId={session.user.id}
                  organizationName={todo.organizations?.name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-purple-200">
              <p className="text-purple-500">No tasks found.</p>
              <Link href="/todo/create" className="mt-2 inline-block text-purple-600 hover:text-purple-800">
                Create your first task
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}