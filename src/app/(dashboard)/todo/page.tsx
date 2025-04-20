// src/app/(dashboard)/todos/page.tsx
"use client";

import TodoItem from '@/components/todo/todo-item';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchFromSupabase } from '@/lib/supabase/client-fetcher';

export default function TodosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [todos, setTodos] = useState<any[]>([]);
  const [uniqueTags, setUniqueTags] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get filter parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const priority = typeof searchParams.priority === 'string' ? searchParams.priority : undefined;
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;

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

        setTodos(todosData || []);

        // Get all unique tags for filter dropdown
        const tags = new Set<string>();
        todosData?.forEach(todo => {
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
  }, [searchParams, status, priority, tag]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
        {error}
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
          href="/todos/create" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors w-full sm:w-auto text-center"
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
          <p className="text-purple-500">Loading tasks...</p>
          <div className="mt-2 mx-auto w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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